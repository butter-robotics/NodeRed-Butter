/*
    PlayAnimation node
        * input: message (any).
        * command: play animation on configured robot.
        * output: operation success/failure response.
*/
module.exports = function(RED) {
	function PlayAnimationNode(config) {
		RED.nodes.createNode(this, config);
		this.config = config;
		var node = this;

		const DebugLogger = require('../logger/debug_logger');
		this.debugLogger = new DebugLogger(this, this.config.debugMode);
		
		const butterClientProvider = require('../butter-client/butter-client-provider');
		this.butterHttpClient = butterClientProvider.GetClient(this.config.robotIp);

		node.on('input', async function(msg) {
			let robotIp = this.config.robotIp;
			let animationName = this.config.animationName;

			// check if message has correct json payload - if yes run it instead.
			if (msg.payload.robotIp != undefined && msg.payload.animationName != undefined) {
				this.debugLogger.logIfDebugMode(`Overriding node configuration with incoming payload [ID: ${msg._msgid}]`);

				if (msg.payload.robotIp != this.config.robotIp) {
					this.butterHttpClient = butterClientProvider.GetClient(msg.payload.robotIp);
				}

				robotIp = msg.payload.robotIp;
				animationName = msg.payload.animationName;
				lenient = msg.payload.lenient || this.config.lenient || false;
				relative = msg.payload.relative || this.config.relative || false;
			} else {
				this.butterHttpClient = butterClientProvider.GetClient(this.config.robotIp);
			}


			// play animation.
			try {
				this.debugLogger.logIfDebugMode(`Attempting to play animation - ${animationName}`);
				butterResponse = await this.butterHttpClient.playAnimation(animationName, lenient, relative);

				this.debugLogger.logIfDebugMode(`Butter response: ${butterResponse.data}`);
				this.send({ payload: butterResponse.data });
			} catch (error) {
				this.debugLogger.logIfDebugMode(`Failed to play animation - ${animationName}\n${error}`);
			}
		});
	}

	// register node type.
	RED.nodes.registerType('play-animation', PlayAnimationNode);
};
