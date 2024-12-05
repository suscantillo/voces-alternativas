import os
from pydub import AudioSegment
import concurrent.futures
import tempfile

def compress_audio(input_path, output_path=None, quality=5):
    """
    Comprime un archivo de audio MP3.
    quality: 0-9 (0=mejor calidad, 9=mayor compresión)
    """
    try:
        # Crear un archivo temporal
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        temp_path = temp_file.name
        temp_file.close()

        # Cargar el audio
        audio = AudioSegment.from_mp3(input_path)
        
        # Exportar con nueva calidad
        audio.export(
            temp_path,
            format="mp3",
            parameters=[
                "-codec:a", "libmp3lame",
                "-qscale:a", str(quality)
            ]
        )
        
        # Verificar si la compresión fue efectiva
        original_size = os.path.getsize(input_path)
        compressed_size = os.path.getsize(temp_path)
        
        if compressed_size < original_size:
            # Si el archivo comprimido es más pequeño, reemplazar el original
            os.replace(temp_path, input_path)
            final_size = compressed_size
        else:
            # Si no hubo reducción, mantener el original
            os.remove(temp_path)
            final_size = original_size
        
        return {
            'file': os.path.basename(input_path),
            'original_size': round(original_size / (1024 * 1024), 2),
            'compressed_size': round(final_size / (1024 * 1024), 2),
            'savings': round((original_size - final_size) / original_size * 100, 2)
        }
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return {
            'file': os.path.basename(input_path),
            'error': str(e)
        }

def compress_directory(directory_path, quality=5, max_workers=4):
    """
    Comprime todos los archivos MP3 en un directorio y sus subdirectorios.
    """
    # Encontrar todos los archivos MP3
    mp3_files = []
    for root, dirs, files in os.walk(directory_path):
        for file in files:
            if file.lower().endswith('.mp3'):
                mp3_files.append(os.path.join(root, file))
    
    total_files = len(mp3_files)
    print(f"Encontrados {total_files} archivos MP3")
    
    # Comprimir archivos usando múltiples hilos
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_file = {
            executor.submit(compress_audio, file, quality=quality): file
            for file in mp3_files
        }
        
        completed = 0
        for future in concurrent.futures.as_completed(future_to_file):
            completed += 1
            result = future.result()
            results.append(result)
            
            print(f"\rProgreso: {completed}/{total_files} ({(completed/total_files*100):.1f}%)", end="")
            if 'error' in result:
                print(f"\nError en {result['file']}: {result['error']}")
            else:
                print(f"\nComprimido: {result['file']}")
                print(f"Tamaño original: {result['original_size']}MB")
                print(f"Tamaño nuevo: {result['compressed_size']}MB")
                print(f"Ahorro: {result['savings']}%")
    
    return results

if __name__ == "__main__":
    # Configuración
    AUDIO_DIR = "public/loops"  # Cambiar a tu directorio
    QUALITY = 7           # 0-9 (9 = máxima compresión)
    MAX_WORKERS = 4       # Número de procesadores paralelos
    
    print(f"Iniciando compresión de archivos (Calidad: {QUALITY})...")
    results = compress_directory(AUDIO_DIR, QUALITY, MAX_WORKERS)
    
    # Mostrar resumen
    successful_results = [r for r in results if 'original_size' in r]
    total_original = sum(r['original_size'] for r in successful_results)
    total_compressed = sum(r['compressed_size'] for r in successful_results)
    total_savings = (total_original - total_compressed) / total_original * 100 if total_original > 0 else 0
    
    print("\n" + "="*50)
    print("RESUMEN FINAL:")
    print(f"Archivos procesados: {len(results)}")
    print(f"Tamaño original total: {total_original:.2f} MB")
    print(f"Tamaño comprimido total: {total_compressed:.2f} MB")
    print(f"Ahorro total: {total_savings:.2f}%")
    
    # Mostrar errores
    errors = [r for r in results if 'error' in r]
    if errors:
        print("\nErrores encontrados:")
        for error in errors:
            print(f"- {error['file']}: {error['error']}")