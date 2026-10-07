const ALBUMS_CONFIG = [
  {
    id: "onedrive-demo",
    title: "Carpeta Compartida OneDrive",
    artist: "Varios Artistas",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80",
    // Enlace público de prueba provisto
    oneDriveShareUrl: "https://1drv.ms/f/c/8e4d86775c2e06df/IgCs5bXB7IQLSaFBl4S5XLLSATRNPLRMtvb9xRAovRYmTdE?e=lozpQb",
    // Tracks de reserva en caso de restricción estricta de CORS en el navegador
    fallbackTracks: [
      {
        id: "1",
        name: "Demo Track 01 - Sample Audio",
        duration: "2:30",
        downloadUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      },
      {
        id: "2",
        name: "Demo Track 02 - Sample Audio",
        duration: "4:05",
        downloadUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
      }
    ]
  }
];
