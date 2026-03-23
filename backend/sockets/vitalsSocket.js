function initVitalsSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Stream live vitals every 1200ms
    const vitalsInterval = setInterval(() => {
      const hr = 70 + Math.floor(Math.random() * 5 - 2);
      const sysBP = 119 + Math.floor(Math.random() * 6 - 3);
      const diaBP = 81 + Math.floor(Math.random() * 4 - 2);
      const spo2 = 98 + Math.floor(Math.random() * 2);
      const temp = (36.8 + Math.random() * 0.4).toFixed(1);

      socket.emit('vitals_update', {
        hr,
        bp: `${sysBP}/${diaBP}`,
        spo2,
        temp
      });
    }, 1200);

    // Listen for step changes from client
    socket.on('step_change', (data) => {
      const stepName = data.stepName || `Step ${data.stepIndex + 1}`;
      socket.emit('aria_alert', {
        message: `Advancing to: ${stepName}`,
        stepIndex: data.stepIndex
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      clearInterval(vitalsInterval);
    });
  });
}

module.exports = initVitalsSocket;
