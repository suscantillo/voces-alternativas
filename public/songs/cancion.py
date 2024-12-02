import os
import json

def generate_tracks_constant():
    # Obtener la lista de archivos MP3 en el directorio actual
    songs = [f for f in os.listdir('.') if f.endswith('.mp3')]
    
    # Crear la estructura de datos para las canciones
    tracks_data = {
        "songs": [
            {
                "id": f"s{i+1}",
                "name": song[:-4],  # Eliminar la extensión .mp3
                "type": "song",
                "url": f"/songs/{song}"
            }
            for i, song in enumerate(sorted(songs))
        ],
        "loops": []  # Mantener loops vacío por ahora
    }
    
    # Generar el código JavaScript
    js_code = "const tracks = " + json.dumps(tracks_data, indent=2, ensure_ascii=False)
    
    # Formatear el código para que se vea mejor en JavaScript
    js_code = js_code.replace('"songs":', 'songs:')
    js_code = js_code.replace('"loops":', 'loops:')
    js_code = js_code.replace('"id":', 'id:')
    js_code = js_code.replace('"name":', 'name:')
    js_code = js_code.replace('"type":', 'type:')
    js_code = js_code.replace('"url":', 'url:')
    
    # Guardar en un archivo JavaScript
    with open('tracks.js', 'w', encoding='utf-8') as f:
        f.write(js_code + ';\n\nexport default tracks;')
    
    # También mostrar en consola
    print("✅ Constante 'tracks' generada en tracks.js")
    print("\nCódigo generado:")
    print("-" * 50)
    print(js_code)

if __name__ == "__main__":
    try:
        generate_tracks_constant()
    except Exception as e:
        print(f"❌ Error: {str(e)}")