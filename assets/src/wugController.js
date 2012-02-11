/**	
 *	WUG Controller
 */
var	WUG = (function( wu, three, tween ) {

	/** Initialize
	*/
	if( !THREE.validateWebGL() ) return false;

	var state = {

		"distance" : 10000, 
		"distanceTarget" : 1900,
		"fullyLoaded": false
	};


	/** UI Elements & event Listeners
	 */
	var container = document.createElement( 'div' );
	document.body.appendChild( container );

	var guicon = document.getElementById( 'gui-container' );
	var namecon = document.getElementById( 'date-display' );
	var aboutcon = document.getElementById( 'about' );

	document.getElementById( 'about-toggle' ).addEventListener( 'click', toggleAbout, false );

	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	container.addEventListener( 'mousedown', onMouseDown, false );
	container.addEventListener( 'mousewheel', onMouseWheel, false );

	var overRenderer = false;
	container.addEventListener( 'mouseover', function() {

		overRenderer = true;
	}, false );

	container.addEventListener( 'mouseout', function() {

		overRenderer = false;
	}, false );

	window.addEventListener( 'resize', onWindowResize, false );


	/** General class attribute utilities
	 */
	function hasClass( ele, cls ) {

		return ele.className.match( new RegExp('(\\s|^)'+ cls +'(\\s|$)') );
	}

	function addClass( ele, cls ) {

		if( !hasClass( ele, cls )) ele.className += " "+ cls;
	}

	function removeClass( ele, cls ) {

		if( hasClass( ele, cls )) {
			var reg = new RegExp('(\\s|^)'+ cls +'(\\s|$)');
			ele.className = ( ele.className.replace( reg,' ' ) ).replace( /^[ ]+|[ ]+$/, '' );
		}
	}


	/** User Interaction / selection of datasets
	 */
	var guis = [];
	var months = {
		"01":"January",
		"02":"February",
		"03":"March",
		"04":"April",
		"05":"May",
		"06":"June",
		"07":"July",
		"08":"August",
		"09":"September",
		"10":"October",
		"11":"November",
		"12":"December"
	};

	/** Update UI and visualization
	 */
	function updateGuis( event ) {
		var node = this, currNode = state.currentNode || node, wait;
		var newSet = node.getAttribute( 'data-date' );
		var currSet = state.currentSet;

		if( !newSet ) return false;
		if( !currSet ) currSet = "current";

		// Throttle mouseover events
		if( event && event.type == "mouseover" ) {

			node.addEventListener( 'mouseout', onGuiMouseOut, false );
			wait = setTimeout( updateDataState, 200 );

		} else updateDataState();

		function onGuiMouseOut( event ) {

			clearTimeout( wait );
			cleanEvents();
		}

		/** Update UI and begin tween to new dataset
		 */
		function updateDataState() {
			var nameParts = newSet.split('-');

			removeClass( currNode, 'active' );
			addClass( node, 'active' );
			cleanEvents();

			namecon.textContent = months[ nameParts[1] ] +" "+ nameParts[0];

			wu.model.tweenTo( currSet, newSet, updateGlobeAtts );
			state.currentNode = node;
			state.currentSet = newSet;
		}

		/** Update displacement and opacity
		 */
		var globeAtts = wu.view.objects.globe.material.attributes;

		function updateGlobeAtts( displacement, opacity ) {

			globeAtts.displacement.value = displacement;
			globeAtts.opacity.value = opacity;

			// flag updates
			globeAtts.displacement.needsUpdate = true;
			globeAtts.opacity.needsUpdate = true;
		}

		function cleanEvents() {

			node.removeEventListener( 'mouseout', onGuiMouseOut, false );
		}
	}

	function equalizeGuis() {
		var el = guis.length;
		var ewidth = Math.floor( window.innerWidth / el );

		for( var e = 0; e < el; e ++ ) {

			guis[ e ].style.width = ewidth + "px";
		}
	}

	/** Create UI elements representing each dataset
	 */
	function createGuis( names ) {
		var elem;

		for( var i = 0, il = names.length; i < il; i ++ ) {

			elem = document.createElement( 'div' );
			elem.setAttribute( 'id', "month-"+ names[ i ] );
			elem.setAttribute( 'data-date', names[ i ] );
			elem.setAttribute( 'class', 'loading' );

			guicon.appendChild( elem );
			guis.push( elem );
		}

		equalizeGuis();
	}

	/** Data for element is loaded, enable interaction
	 */
	function enableGui( name, loaded, loading ) {
		var elem = document.getElementById( "month-"+ name );

		if( elem ) {

			elem.setAttribute( 'class', 'loaded' );
			elem.addEventListener( 'mouseover', updateGuis );
		}

		if( loaded == 1 ) {

			animate();
			updateGuis.call( elem );
		}

		if( loaded == loading ) document.body.className = "loaded";
	}

	/** Load next data set
	 */
	function loadNextSet() {
		var currYear = state.currentSet;
		var nextYear = !currYear ? wu.model.range[1].year : currYear.split('-')[0] - 1;

		if( nextYear < wu.model.range[0].year ) {

			state.fullyLoaded = true;
			return false;
		}

		document.body.className = "loading";
		wu.model.loadData( nextYear, createGuis, enableGui );
	}

	/** Modification of state via hotkeys
	 */
	function onKeyDown( event ) {
		var node, dir, date, curr = state.currentNode || guis[0];

		switch( event.keyCode ) {

			case 16 : // shift

				keys.shft = true;
			break;
			case 17 : // control

				keys.ctrl = true;
			break;
			case 39 : // >

				node = curr.previousSibling;
				dir = "next";
			break;
			case 37 : // <

				node = curr.nextSibling;
				dir = "prev";
			break;
		}

		if( node ) {

			updateGuis.call( node, event );

		} else if( dir == "prev" && !state.fullyLoaded ) {

			loadNextSet();
		}
	}

	function onKeyUp( event ) {

		switch( event.keyCode ) {

			case 16 : // shift

				keys.shft = false;
			break;
			case 17 : // control

				keys.ctrl = false;
			break;
		}
	}

	/** User interaction with 3D scene
	 */
	var projector = new three.Projector();
	var sceneObjects = wu.view.objects;
	var radius = sceneObjects.globe.radius;

	function intersectScene( event ) {
		var vector, ray, intersects;
		var point, coords, dir, verts, v0, v1;
		var hitPent = sceneObjects.hitPent;
		var hitLine = sceneObjects.hitLine;

		vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		projector.unprojectVector( vector, camera );

		ray = new three.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
		intersects = ray.intersectScene( scene );

		if( intersects.length > 0 ) {

			point = intersects[0].point;

			// Geo-location
			coords = point.sphereCoord( radius );
			console.log( coords );

			// Hit polygon - planar
			hitPent.position.copy( point );
			hitPent.lookAt( new three.Vector3( 0, 0, 0 ));

			// Hit line - normal
			dir = point.clone().normalize();
			v0 = dir.clone().multiplyScalar( 10000 );
			v1 = dir.clone().multiplyScalar( 350 );

			verts = hitLine.geometry.vertices;
			verts[0].position = v0;
			verts[1].position = v1;
			hitLine.geometry.__dirtyVertices = true;
		}
	}

	/** Orbit & zoom controls
	 */
	var pi = Math.PI, pihalf = pi / 2;

	var keys = { shft: false, ctrl: false };
	var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };

	var rotation = { x: pi * 3/2, y: pi / 6.0 };
	var target = { x: 0, y: 0 }, targetOnDown = { x: 0, y: 0 };
	var curZoomSpeed = 0, zoomSpeed = 50;

	function onMouseDown( event ) {

		event.preventDefault();

		container.addEventListener( 'mousemove', onMouseMove, false );
		container.addEventListener( 'mouseup', onMouseUp, false );
		container.addEventListener( 'mouseout', onMouseOut, false );

		mouseOnDown.x = - event.clientX;
		mouseOnDown.y = event.clientY;

		targetOnDown.x = target.x;
		targetOnDown.y = target.y;

		if( keys.shft ) {

			intersectScene( event );
		}

		container.style.cursor = 'move';
	}

	function onMouseMove( event ) {

		mouse.x = - event.clientX;
		mouse.y = event.clientY;

		var zoomDamp = distance / 1000;

		target.x = targetOnDown.x + ( mouse.x - mouseOnDown.x ) * 0.005 * zoomDamp;
		target.y = targetOnDown.y + ( mouse.y - mouseOnDown.y ) * 0.005 * zoomDamp;

		target.y = target.y > pihalf ? pihalf : target.y;
		target.y = target.y < - pihalf ? - pihalf : target.y;
	}

	function onMouseUp( event ) {

		container.removeEventListener( 'mousemove', onMouseMove, false );
		container.removeEventListener( 'mouseup', onMouseUp, false );
		container.removeEventListener( 'mouseout', onMouseOut, false );
		container.style.cursor = 'auto';
	}

	function onMouseOut( event ) {

		container.removeEventListener( 'mousemove', onMouseMove, false );
		container.removeEventListener( 'mouseup', onMouseUp, false );
		container.removeEventListener( 'mouseout', onMouseOut, false );
	}

	function onMouseWheel( event ) {

		event.preventDefault();
		if( overRenderer ) {
			zoom(event.wheelDeltaY * 0.3);
		}
		return false;
	}

	function onWindowResize( event ) {

		console.log('resize');
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
		equalizeGuis();
	}

	function toggleAbout( event ) {
	var	isopen = state.aboutOpen || false;

		if( !isopen ) addClass( aboutcon, "show" );
		else aboutcon.className = "";

		state.aboutOpen = !isopen;

		if( !isopen ) container.addEventListener( 'mousedown', toggleAbout, false );
		else container.removeEventListener( 'mousedown', toggleAbout, false );
	}


	/** Anmimation & rendering
	*/
	var scene = wu.view.scene;
	var distance = state.distance, distanceTarget = state.distanceTarget;

	var camera = wu.view.camera;
	var ctarget = new three.Vector3( 0, 0, 0 );
	camera.position.z = distance;

	var renderer = new three.WebGLRenderer();
	renderer.autoClear = false;
	renderer.setClearColorHex( 0x000000, 0.0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	var hitPent = wu.view.objects.hitPent;

	function animate() {

		requestAnimationFrame( animate );
		update();
		render();
	}

	function update() {
	var	counter = state.counter || 0;

		counter = counter < pi ? counter + pi / 128 : 0;
		state.counter = counter;
	}

	function zoom( delta ) {

		distanceTarget -= delta;
		distanceTarget = distanceTarget > 2200 ? 2200 : distanceTarget;
		distanceTarget = distanceTarget < 1200 ? 1200 : distanceTarget;
	}

	function render() {

		zoom( curZoomSpeed );

		var pscale = Math.sin( state.counter );
		hitPent.scale.set( pscale, pscale, 1 );

		rotation.x += ( target.x - rotation.x ) * 0.1;
		rotation.y += ( target.y - rotation.y ) * 0.1;
		distance += ( distanceTarget - distance );

		camera.position.x = distance * Math.sin( rotation.x ) * Math.cos( rotation.y );
		camera.position.y = distance * Math.sin( rotation.y );
		camera.position.z = distance * Math.cos( rotation.x ) * Math.cos( rotation.y );

		ctarget.y = -camera.position.y / 10; 

		camera.lookAt( ctarget );

		renderer.clear();
		renderer.render( scene, camera );

		tween.update();
	}

	/** Prompt download of arbitrary text content
	 */
	function exportText( text ) {
	var	content = "data:application/plain;charset=utf-8," + escape( text );
	    window.open( content, "data", "width=500,height=10" );
	}

	/** Public
	 */
	wu.state = state;

	/** Initial load
	 */
	loadNextSet();

	return wu;

})( WUG || {}, THREE, TWEEN );

