function setupLogger() {
    return {
        info: (message) => {
            console.log(`[${new Date().toISOString()}] INFO: ${message}`);
        }
    };
}

module.exports = { setupLogger };
