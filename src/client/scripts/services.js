'use strict';

angular.module('app.services', []).
service('$menuItems', function() {
	this.menuItems = [];

	var $menuItemsRef = this;

	var menuItemObj = {
		parent: null,

		title: '',
		link: '', // starting with "./" will refer to parent link concatenation
		state: '', // will be generated from link automatically where "/" (forward slashes) are replaced with "."
		icon: '',

		isActive: false,
		label: null,

		menuItems: [],

		setLabel: function(label, color, hideWhenCollapsed) {
			if (typeof hideWhenCollapsed == 'undefined')
				hideWhenCollapsed = true;

			this.label = {
				text: label,
				classname: color,
				collapsedHide: hideWhenCollapsed
			};

			return this;
		},

		addItem: function(title, link, icon, otherNames, plainLink) {
			var parent = this,
				item = angular.extend(angular.copy(menuItemObj), {
					parent: parent,

					title: title,
					link: link,
					icon: icon,
					isPlainLink: plainLink || false,
					otherNames: otherNames || undefined
				});

			if (item.link) {
				if (item.link.match(/^\./))
					item.link = parent.link + item.link.substring(1, link.length);

				if (item.link.match(/^-/))
					item.link = parent.link + '-' + item.link.substring(2, link.length);

				item.state = $menuItemsRef.toStatePath(item.link);
			}

			this.menuItems.push(item);

			return item;
		}
	};

	this.addItem = function(title, link, icon, otherNames, open, plainLink) {
		var item = angular.extend(angular.copy(menuItemObj), {
			title: title,
			link: link,
			state: this.toStatePath(link),
			icon: icon,
			isOpen: open || false,
			isPlainLink: plainLink || false,
			otherNames: otherNames || undefined
		});

		this.menuItems.push(item);

		return item;
	};

	this.getAll = function() {
		return this.menuItems;
	};

	this.prepareSidebarMenu = function() {
		var dashboard = this.addItem('Dashboard', '/app/dashboard', 'ti-dashboard');
		var library = this.addItem('Library', '/app/library', 'ti-files');
		var diagram = this.addItem('Diagram', '/app/diagram', 'ti-blackboard');		

		this.addItem('Engagements', '/app/engagements', 'ti-calendar', 'proposals');		
		/*this.addItem('Proposals', '/app/proposals', 'linecons-calendar');		*/
		this.addItem('Projects', '/app/projects', 'ti-folder');	
		this.addItem('Project Types', '/app/projectTypes', 'ti-list');		
		this.addItem('Report Writer', 'http://172.31.36.244:8000/home/', 'ti-write', undefined,false,true);	
		this.addItem('Fund Template', '/app/fundTemplates', 'ti-receipt');
		this.addItem('Trade Types', '/app/tradeTypes', 'ti-list');
		this.addItem('Document Types', '/app/documentTypes', 'ti-list');
		/*this.addItem('Trade ', '/app/trade', 'linecons-calendar');*/

		var admin = this.addItem('Admin',	'/app/admin',	'ti-unlock', undefined,true);
		admin.addItem('Organizations', 	'/app/organizations', 'ti-agenda', 'organizations');
		admin.addItem('Settings', 	'/app/settings', 'ti-settings', 'settings');
		admin.addItem('App Users', 	'/app/appUsers', 'ti-user');

		/*admin.addItem('Organizations', 	'/app/organizations');
		admin.addItem('Users', 	'/app/users');*/

		//TODO: Hookup when organization GET/:id service is available.
		/*var admin = this.addItem('Admin',	'/app/admin',	'linecons-key', true);*/
		/*admin.addItem('Settings', 	'/app/settings', 'linecons-cog');*/

		return this;
	};

	this.prepareHorizontalMenu = function() {
		var dashboard = this.addItem('Dashboard', '/app/dashboard', 'linecons-cog');
		
		return this;
	}

	this.instantiate = function() {
		return angular.copy(this);
	}

	this.toStatePath = function(path) {
		return path.replace(/\//g, '.').replace(/^\./, '');
	};

	this.setActive = function(path) {
		this.iterateCheck(this.menuItems, this.toStatePath(path));
	};

	this.setActiveParent = function(item) {
		item.isActive = true;
		item.isOpen = true;

		if (item.parent)
			this.setActiveParent(item.parent);
	};

	this.iterateCheck = function(menuItems, currentState) {
		angular.forEach(menuItems, function(item) {
			if (item.state == currentState) {
				item.isActive = true;

				if (item.parent != null)
					$menuItemsRef.setActiveParent(item.parent);
			} else {
				item.isActive = false;
				// item.isOpen = false;
				var urlItems = currentState.split(".");			
				if(urlItems.length >= 2 && item.otherNames == urlItems[1]){
					item.isActive = true;

					if (item.parent != null)
					$menuItemsRef.setActiveParent(item.parent);	
				}

				if (item.menuItems.length) {
					$menuItemsRef.iterateCheck(item.menuItems, currentState);
				}
			}
		});
	}
});
