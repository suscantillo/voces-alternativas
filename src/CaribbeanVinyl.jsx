import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Music, Disc2, X } from 'lucide-react';

const LoadingScreen = ({ progress }) => (
  <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center z-50">
    <div className="relative w-32 h-32 mb-8">
      <div 
        className="absolute inset-0 rounded-full bg-[#1A1A1A] border border-[#FF1F5A]/20 animate-spin"
      >
        <div className="absolute inset-[15%] rounded-full border border-[#FF1F5A]/10" />
        <div className="absolute inset-[30%] rounded-full border border-[#FF1F5A]/10" />
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-[#FF1F5A]">
          <div className="absolute inset-2 rounded-full bg-[#1A1A1A] flex items-center justify-center">
            <span className="text-[#FF1F5A] text-xs font-bold text-center">BAQ<br/>BAQ</span>
          </div>
        </div>
      </div>
    </div>
    
    <div className="w-64 h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-[#FF1F5A] to-[#9B4BFF] transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
    
    <div className="mt-4 text-[#FF1F5A] font-medium">
      Cargando Pistas ({Math.round(progress)}%)
    </div>
  </div>
);

const VirtualMixer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('songs');
  const [activeTracks, setActiveTracks] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [audioStates, setAudioStates] = useState({});
  const [loadedTracks, setLoadedTracks] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const audioContext = useRef(null);
  const audioSources = useRef({});
  const gainNodes = useRef({});

  // Añade esta función después de los estados
const loadTrackInChunks = async (track) => {
  if (!audioContext.current) return null;

  try {
    const response = await fetch(track.url);
    const contentLength = response.headers.get('Content-Length');
    const total = parseInt(contentLength, 10);
    const reader = response.body.getReader();
    const chunks = [];
    let loadedSize = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      loadedSize += value.length;
      // Actualizar progreso para este track
      const progress = (loadedSize / total) * 100;
      console.log(`Loading ${track.name}: ${Math.round(progress)}%`);
    }

    // Combinar chunks en un único buffer
    const completeBuffer = new Uint8Array(loadedSize);
    let position = 0;
    for (const chunk of chunks) {
      completeBuffer.set(chunk, position);
      position += chunk.length;
    }

    // Decodificar el buffer completo
    const audioBuffer = await audioContext.current.decodeAudioData(completeBuffer.buffer);
    return audioBuffer;
  } catch (error) {
    console.error('Error loading track:', error);
    return null;
  }
};
  const tracks = {
    songs: [
      {
        id: "s1",
        name: "Alan Walker - Faded",
        type: "song",
        url: "/songs/Alan Walker - Faded.mp3"
      },
      {
        id: "s2",
        name: "Avicii - The Nights (Lyric Video)",
        type: "song",
        url: "/songs/Avicii - The Nights (Lyric Video).mp3"
      },
      {
        id: "s3",
        name: "Bésame - Luister La Voz",
        type: "song",
        url: "/songs/Bésame - Luister La Voz.mp3"
      },
      {
        id: "s4",
        name: "Cali Flow Latino - Paguan Paguan (La Patineta)",
        type: "song",
        url: "/songs/Cali Flow Latino - Paguan Paguan (La Patineta).mp3"
      },
      {
        id: "s5",
        name: "Calle 13 - Atrevete te te",
        type: "song",
        url: "/songs/Calle 13 - Atrevete te te.mp3"
      },
      {
        id: "s6",
        name: "Canserbero - Maquiavélico",
        type: "song",
        url: "/songs/Canserbero - Maquiavélico.mp3"
      },
      {
        id: "s7",
        name: "Colombia tierra querida - Juan Carlos Coronel, Lucho Bermúdez",
        type: "song",
        url: "/songs/Colombia tierra querida - Juan Carlos Coronel, Lucho Bermúdez.mp3"
      },
      {
        id: "s8",
        name: "Despacito - Luis Fonsi, Daddy Yankee",
        type: "song",
        url: "/songs/Despacito - Luis Fonsi, Daddy Yankee.mp3"
      },
      {
        id: "s9",
        name: "Diomedes Díaz - Tu Eres La Reina  (Letra Oficial)",
        type: "song",
        url: "/songs/Diomedes Díaz - Tu Eres La Reina  (Letra Oficial).mp3"
      },
      {
        id: "s10",
        name: "EL MAPALÉ - Gerardo Varela",
        type: "song",
        url: "/songs/EL MAPALÉ - Gerardo Varela.mp3"
      },
      {
        id: "s11",
        name: "Eichem - Miss Independent (Audio oficial)",
        type: "song",
        url: "/songs/Eichem - Miss Independent (Audio oficial).mp3"
      },
      {
        id: "s12",
        name: "El Entrompe - PerreoPalosBarios",
        type: "song",
        url: "/songs/El Entrompe - PerreoPalosBarios.mp3"
      },
      {
        id: "s13",
        name: "HABA - Gaita Loop (Live Session)",
        type: "song",
        url: "/songs/HABA - Gaita Loop (Live Session).mp3"
      },
      {
        id: "s14",
        name: "Ira Collage - Mal de Ojo",
        type: "song",
        url: "/songs/Ira Collage - Mal de Ojo.mp3"
      },
      {
        id: "s15",
        name: "Joe Arroyo - En Barranquilla Me Quedo",
        type: "song",
        url: "/songs/Joe Arroyo - En Barranquilla Me Quedo.mp3"
      },
      {
        id: "s16",
        name: "LA ZENAIDA - Armando Hernandez",
        type: "song",
        url: "/songs/LA ZENAIDA - Armando Hernandez.mp3"
      },
      {
        id: "s17",
        name: "La Pollera colora - Juan Madera",
        type: "song",
        url: "/songs/La Pollera colora - Juan Madera.mp3"
      },
      {
        id: "s18",
        name: "La Puya",
        type: "song",
        url: "/songs/La Puya.mp3"
      },
      {
        id: "s19",
        name: "La Reina de los Jardines - El Sexteto Tabalá",
        type: "song",
        url: "/songs/La Reina de los Jardines - El Sexteto Tabalá.mp3"
      },
      {
        id: "s20",
        name: "La Tierra del Olvido - Carlos Vives, Coral Group, Maluma, Fanny Lu, Andrea Echeverri, Cholo Valderrama, Herencia de Timbiquí, Fonseca",
        type: "song",
        url: "/songs/La Tierra del Olvido - Carlos Vives, Coral Group, Maluma, Fanny Lu, Andrea Echeverri, Cholo Valderrama, Herencia de Timbiquí, Fonseca.mp3"
      },
      {
        id: "s21",
        name: "La Verdolaga - Totó la Moposina",
        type: "song",
        url: "/songs/La Verdolaga - Totó la Moposina.mp3"
      },
      {
        id: "s22",
        name: "La grosella - Damar Guerrero",
        type: "song",
        url: "/songs/La grosella - Damar Guerrero.mp3"
      },
      {
        id: "s23",
        name: "Lloraras - Oscar D_León",
        type: "song",
        url: "/songs/Lloraras - Oscar D_León.mp3"
      },
      {
        id: "s24",
        name: "Los Caminos De La Vida - Los Diablitos",
        type: "song",
        url: "/songs/Los Caminos De La Vida - Los Diablitos.mp3"
      },
      {
        id: "s25",
        name: "Navigator - Ragga Tonseh",
        type: "song",
        url: "/songs/Navigator - Ragga Tonseh.mp3"
      },
      {
        id: "s26",
        name: "Orito Cantora, Jenn del Tambó - Bullerengue para un Ángel",
        type: "song",
        url: "/songs/Orito Cantora, Jenn del Tambó - Bullerengue para un Ángel.mp3"
      },
      {
        id: "s27",
        name: "Pacifico Soy - Electropicomusic",
        type: "song",
        url: "/songs/Pacifico Soy - Electropicomusic.mp3"
      },
      {
        id: "s28",
        name: "Prende La Vela -  Totó la Momposina",
        type: "song",
        url: "/songs/Prende La Vela -  Totó la Momposina.mp3"
      },
      {
        id: "s29",
        name: "The Satanic Majesties Request, Johann Daccaret - Sister_s Blues",
        type: "song",
        url: "/songs/The Satanic Majesties Request, Johann Daccaret - Sister_s Blues.mp3"
      },
      {
        id: "s30",
        name: "Todo Le Luce - Quendambuxx",
        type: "song",
        url: "/songs/Todo Le Luce - Quendambuxx.mp3"
      },
      {
        id: "s31",
        name: "Trastocando - Humo Azul",
        type: "song",
        url: "/songs/Trastocando - Humo Azul.mp3"
      },
      {
        id: "s32",
        name: "Zaider - Te Va Doler",
        type: "song",
        url: "/songs/Zaider - Te Va Doler.mp3"
      },
      {
        id: "s33",
        name: "Zouke Zouke - Pépé Kallé, Nyboma",
        type: "song",
        url: "/songs/Zouke Zouke - Pépé Kallé, Nyboma.mp3"
      }
    ],
    loops: [
      {
        id: "l1",
        name: "@Cainã Sampaio",
        type: "loop",
        url: "/loops/@Cainã Sampaio.mp3"
      },
      {
        id: "l2",
        name: "@Dj Neto",
        type: "loop",
        url: "/loops/@Dj Neto.mp3"
      },
      {
        id: "l3",
        name: "@Drum Skin(1)",
        type: "loop",
        url: "/loops/@Drum Skin(1).mp3"
      },
      {
        id: "l4",
        name: "@Drum Skin",
        type: "loop",
        url: "/loops/@Drum Skin.mp3"
      },
      {
        id: "l5",
        name: "@J Miller (2)",
        type: "loop",
        url: "/loops/@J Miller (2).mp3"
      },
      {
        id: "l6",
        name: "@J Miller (3)",
        type: "loop",
        url: "/loops/@J Miller (3).mp3"
      },
      {
        id: "l7",
        name: "@J Miller (4)",
        type: "loop",
        url: "/loops/@J Miller (4).mp3"
      },
      {
        id: "l8",
        name: "@J Miller",
        type: "loop",
        url: "/loops/@J Miller.mp3"
      },
      {
        id: "l9",
        name: "@Negusfirst",
        type: "loop",
        url: "/loops/@Negusfirst.mp3"
      },
      {
        id: "l10",
        name: "@Negusfirst.mp3 (2)",
        type: "loop",
        url: "/loops/@Negusfirst.mp3 (2).mp3"
      },
      {
        id: "l11",
        name: "@SebasTorresMusic",
        type: "loop",
        url: "/loops/@SebasTorresMusic.mp3"
      },
      {
        id: "l12",
        name: "@choppedbyjodi",
        type: "loop",
        url: "/loops/@choppedbyjodi.mp3"
      },
      {
        id: "l13",
        name: "@gloccas",
        type: "loop",
        url: "/loops/@gloccas.mp3"
      },
      {
        id: "l14",
        name: "@moonbladex",
        type: "loop",
        url: "/loops/@moonbladex.mp3"
      },
      {
        id: "l15",
        name: "@moonbladex.mp3 (2)",
        type: "loop",
        url: "/loops/@moonbladex.mp3 (2).mp3"
      },
      {
        id: "l16",
        name: "@prettyboyaust",
        type: "loop",
        url: "/loops/@prettyboyaust.mp3"
      },
      {
        id: "l17",
        name: "@prodnewdawn",
        type: "loop",
        url: "/loops/@prodnewdawn.mp3"
      }
]
  };

  // Inicialización y precarga
  // Reemplaza el useEffect de inicialización actual
useEffect(() => {
  const initializeAudio = async () => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    
    // Separar tracks en prioritarios y secundarios
    const priorityTracks = tracks.songs.slice(0, 5); // Primeras 5 canciones
    const remainingTracks = [
      ...tracks.songs.slice(5),
      ...tracks.loops
    ];

    // Cargar tracks prioritarios
    let loadedCount = 0;
    const totalTracks = tracks.songs.length + tracks.loops.length;

    // Cargar prioritarios primero
    for (const track of priorityTracks) {
      const audioBuffer = await loadTrackInChunks(track);
      if (audioBuffer) {
        setLoadedTracks(prev => ({ ...prev, [track.id]: audioBuffer }));
        loadedCount++;
        setLoadingProgress((loadedCount / totalTracks) * 100);
      }
    }

    // Permitir el uso de la app después de cargar los prioritarios
    setLoading(false);

    // Cargar el resto en segundo plano
    setTimeout(async () => {
      for (const track of remainingTracks) {
        const audioBuffer = await loadTrackInChunks(track);
        if (audioBuffer) {
          setLoadedTracks(prev => ({ ...prev, [track.id]: audioBuffer }));
          loadedCount++;
          // No actualizamos loadingProgress aquí para no confundir al usuario
        }
      }
    }, 1000);
  };

  initializeAudio();

  return () => {
    if (audioContext.current) {
      audioContext.current.close();
    }
  };
}, []);


  // Mantener la animación del disco durante la carga
  useEffect(() => {
    let animationFrame;
    const animate = () => {
      setRotation(prev => (prev + 1) % 360);
      animationFrame = requestAnimationFrame(animate);
    };
    
    if (loading || isPlaying) {
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => cancelAnimationFrame(animationFrame);
  }, [loading, isPlaying]);
  // Función para precargar audio
  const preloadAudioBuffer = async (track) => {
    if (loadedTracks[track.id]) return loadedTracks[track.id];
    
    try {
      const response = await fetch(track.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
      setLoadedTracks(prev => ({ ...prev, [track.id]: audioBuffer }));
      return audioBuffer;
    } catch (error) {
      console.error('Error preloading track:', error);
      return null;
    }
  };

  // Función para cargar una pista
  const loadTrack = async (track) => {
    try {
      if (!audioContext.current) return;
      
      // Usar buffer precargado o cargarlo si no existe
      let audioBuffer = loadedTracks[track.id];
      
      if (!audioBuffer) {
        audioBuffer = await loadTrackInChunks(track);
        if (!audioBuffer) return;
        setLoadedTracks(prev => ({ ...prev, [track.id]: audioBuffer }));
      }
  
      const source = audioContext.current.createBufferSource();
      const gainNode = audioContext.current.createGain();
      
      source.buffer = audioBuffer;
      source.loop = track.type === 'loop';
      source.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      
      source.startTime = audioContext.current.currentTime;
      audioSources.current[track.id] = source;
      gainNodes.current[track.id] = gainNode;
      
      if (isPlaying) {
        source.start(0);
      }
      
      setActiveTracks(prev => [...prev, { ...track, volume: 0.75 }]);
    } catch (error) {
      console.error('Error loading track:', error);
    }
  };

  // Función para alternar reproducción
  const togglePlayback = () => {
    if (!isPlaying) {
      audioContext.current.resume();
      activeTracks.forEach(track => {
        const source = audioSources.current[track.id];
        if (source) {
          if (!audioStates[track.id]) {
            source.start(0);
          } else {
            const newSource = audioContext.current.createBufferSource();
            newSource.buffer = source.buffer;
            newSource.loop = source.loop;
            newSource.connect(gainNodes.current[track.id]);
            
            const startOffset = audioStates[track.id].offset || 0;
            newSource.start(0, startOffset);
            newSource.startTime = audioContext.current.currentTime - startOffset;
            audioSources.current[track.id] = newSource;
          }
        }
      });
    } else {
      const currentTime = audioContext.current.currentTime;
      const states = {};
      
      activeTracks.forEach(track => {
        const source = audioSources.current[track.id];
        if (source) {
          const offset = (currentTime - source.startTime) % source.buffer.duration;
          states[track.id] = {
            offset,
            volume: gainNodes.current[track.id].gain.value
          };
          source.stop();
        }
      });
      
      setAudioStates(states);
    }
    setIsPlaying(!isPlaying);
  };

  // Función para ajustar volumen
  const adjustVolume = (trackId, value) => {
    const gainNode = gainNodes.current[trackId];
    if (gainNode) {
      gainNode.gain.value = value;
      setActiveTracks(prev =>
        prev.map(track =>
          track.id === trackId ? { ...track, volume: value } : track
        )
      );
    }
  };

  // Función para remover pista
  const removeTrack = (trackId) => {
    const source = audioSources.current[trackId];
    if (source) {
      try {
        source.stop();
      } catch (e) {}
      delete audioSources.current[trackId];
      delete gainNodes.current[trackId];
      delete audioStates[trackId];
    }
    setActiveTracks(prev => prev.filter(track => track.id !== trackId));
  };
  // Renderizado condicional basado en el estado de carga
  if (loading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white grid grid-rows-[auto_1fr] overflow-hidden">
      {/* Header */}
      <header className="p-4 flex justify-center">
        <div className="relative w-24 h-24">
          <img 
            src="/logo.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 rounded-full border border-[#FF1F5A]/30" />
        </div>
      </header>
  
      {/* Main Content */}
      <main className="grid lg:grid-cols-2 gap-6 p-6 h-full overflow-hidden">
        {/* Left Column */}
        <div className="grid grid-rows-[auto_1fr] gap-6 min-h-0">
          {/* Vinyl */}
          <div className="relative">
            <div className="aspect-square max-w-[320px] mx-auto relative">
              {/* Disc */}
              <div 
                className="absolute inset-0 rounded-full bg-[#1A1A1A] border border-[#FF1F5A]/20"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.1s linear',
                }}
              >
                <div className="absolute inset-[15%] rounded-full border border-[#FF1F5A]/10" />
                <div className="absolute inset-[30%] rounded-full border border-[#FF1F5A]/10" />
              </div>
              
              {/* Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-[#FF1F5A]">
                  <div className="absolute inset-2 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                    <span className="text-[#FF1F5A] text-xs font-bold text-center">BAQ<br/>BAQ</span>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Play Button */}
            <button
              onClick={togglePlayback}
              className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 bg-gradient-to-r from-[#FF1F5A] to-[#9B4BFF] p-6 rounded-full hover:from-[#FF4B7D] hover:to-[#AF6FFF] transition-all shadow-lg shadow-[#FF1F5A]/20 z-10"
            >
              {isPlaying ? 
                <Pause className="text-white w-6 h-6" /> : 
                <Play className="text-white w-6 h-6" />
              }
            </button>
          </div>
  
          {/* Active Tracks */}
          <div className="bg-[#1A1A1A] rounded-xl p-6 min-h-0 overflow-hidden">
            <h2 className="text-[#FF1F5A] text-lg font-bold mb-4">
              Pistas Activas
            </h2>
            <div className="overflow-y-auto space-y-3 h-[calc(100%-3rem)]">
              {activeTracks.map((track) => (
                <div 
                  key={track.id}
                  className="bg-[#0A0A0A] rounded-lg p-4 border border-[#FF1F5A]/10"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => removeTrack(track.id)}
                      className="text-[#FF1F5A] hover:text-[#FF4B7D] transition-all"
                    >
                      <X size={16} />
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm truncate">{track.name}</span>
                        <Volume2 size={14} className="text-[#FF1F5A]" />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={track.volume}
                        onChange={(e) => adjustVolume(track.id, parseFloat(e.target.value))}
                        className="w-full h-1 rounded-full appearance-none bg-[#2A2A2A] accent-[#FF1F5A]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        {/* Right Column */}
        <div className="bg-[#1A1A1A] rounded-xl grid grid-rows-[auto_1fr] overflow-hidden">
          {/* Tabs */}
          <div className="p-4 border-b border-[#FF1F5A]/10">
            <div className="flex gap-3">
              {['songs', 'loops'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg transition-all
                    ${activeTab === tab
                      ? 'bg-gradient-to-r from-[#FF1F5A] to-[#9B4BFF] text-white'
                      : 'bg-[#0A0A0A] text-white/60 hover:text-white border border-[#FF1F5A]/10'
                    }
                  `}
                >
                  {tab === 'songs' ? <Music size={16} /> : <Disc2 size={16} />}
                  <span className="capitalize">{tab}</span>
                </button>
              ))}
            </div>
          </div>
  
          {/* Tracks Grid */}
          <div className="p-4 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tracks[activeTab].map((track) => (
                <button
                  key={track.id}
                  onClick={() => !activeTracks.find(t => t.id === track.id) && loadTrack(track)}
                  disabled={activeTracks.find(t => t.id === track.id)}
                  className={`
                    p-4 rounded-lg text-left border transition-all bg-[#0A0A0A]
                    ${activeTracks.find(t => t.id === track.id)
                      ? 'text-white/30 border-[#2A2A2A] cursor-not-allowed'
                      : 'text-white hover:border-[#FF1F5A] border-[#2A2A2A]'
                    }
                  `}
                >
                  <div className="font-medium text-sm truncate">{track.name}</div>
                  <div className="text-xs text-[#FF1F5A] mt-1">{track.type}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VirtualMixer;