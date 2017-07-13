module.exports = {
	server: ["compass:server", "copy:styles"],
	dist: ["compass:dist", "copy:styles", "htmlmin"],
	lessServer: ["less:server", "copy:styles"],
	lessDist: ["less:dist", "copy:styles", "htmlmin"]
};