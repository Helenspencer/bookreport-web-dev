module.exports = {
	options: {
		mangle: false,
		compress: {
			drop_console: true
		}
	},
	dist: {
		files: {
			"<%= yeoman.dist %>/scripts/app.js": [
			"<%= yeoman.app %>/scripts/services/tag.js",
			".tmp/**/*.js", 
			"<%= yeoman.app %>/scripts/**/*.js", 
			"!<%= yeoman.app %>/scripts/vendors/**",
			"!<%= yeoman.app %>/scripts/document-app.js",
			"!<%= yeoman.app %>/scripts/controllers/document-main.js",
			"!<%= yeoman.app %>/scripts/controllers/document.js",
			"!<%= yeoman.app %>/scripts/controllers/legal-entity.js",
			"!<%= yeoman.app %>/scripts/controllers/party.js",
			"!<%= yeoman.app %>/scripts/controllers/editable-page.js",
			"!<%= yeoman.app %>/scripts/controllers/document-page.js",
			"!<%= yeoman.app %>/scripts/services/document.js",
			"!<%= yeoman.app %>/scripts/services/legal_entity.js",
			"!<%= yeoman.app %>/scripts/controllers/pusher-doc-event-handler.js",
			"!<%= yeoman.app %>/scripts/controllers/spreadsheet_doc_viewer.js",
			"!<%= yeoman.app %>/scripts/controllers/document_pusher.js"],
			"<%= yeoman.dist %>/scripts/document-app.js": [
			"<%= yeoman.app %>/scripts/directives.js",			
			"<%= yeoman.app %>/scripts/directives-custom.js",
			"<%= yeoman.app %>/scripts/factory.js",
			"<%= yeoman.app %>/scripts/angular-fullscreen.js",
			"<%= yeoman.app %>/scripts/document-app.js",
			"<%= yeoman.app %>/scripts/controllers/document-main.js",
			"<%= yeoman.app %>/scripts/controllers/document.js",
			"<%= yeoman.app %>/scripts/controllers/document_pusher.js",
			"<%= yeoman.app %>/scripts/controllers/legal-entity.js",
			"<%= yeoman.app %>/scripts/controllers/editable-page.js",
			"<%= yeoman.app %>/scripts/controllers/document-page.js",
			"<%= yeoman.app %>/scripts/controllers/party.js",
			"<%= yeoman.app %>/scripts/services/document.js",
			"<%= yeoman.app %>/scripts/services/pusher.js",
			"<%= yeoman.app %>/scripts/services/legal_entity.js",
			"<%= yeoman.app %>/scripts/controllers/spreadsheet_doc_viewer.js",
			"<%= yeoman.app %>/scripts/controllers/pusher-doc-event-handler.js",
			"<%= yeoman.app %>/scripts/services/tag.js",
			"<%= yeoman.app %>/scripts/controllers/tag.js"
			]
		}
	}
};