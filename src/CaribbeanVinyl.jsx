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
      // ... resto de las canciones ...
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
      // ... resto de los loops ...
    ]
  };

  // Inicialización y precarga
  useEffect(() => {
    const initializeAudio = async () => {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Calcular total de tracks para el progreso
      const totalTracks = [...tracks.songs, ...tracks.loops];
      let loadedCount = 0;

      // Precargar todos los tracks
      for (const track of totalTracks) {
        await preloadAudioBuffer(track);
        loadedCount++;
        setLoadingProgress((loadedCount / totalTracks.length) * 100);
      }

      setLoading(false);
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
      
      const audioBuffer = loadedTracks[track.id] || await preloadAudioBuffer(track);
      if (!audioBuffer) return;
      
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