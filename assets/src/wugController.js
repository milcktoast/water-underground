/**	
 *	WUG Controller
 */
var	WUG = (function( wu, THREE ) {


/**	Initialize
 */
	if( !THREE.validateWebGL() ) return false;

var	guicon = document.getElementById( 'gui-container' ),
	namecon = document.getElementById( 'date-display' ),
	aboutcon = document.getElementById( 'about' );

	document.getElementById( 'about-toggle' ).addEventListener( 'click', toggleAbout, false );

//	Event Listeners
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	container.addEventListener( 'mousedown', onMouseDown, false );
	container.addEventListener( 'mousewheel', onMouseWheel, false );

var	overRenderer = false;
	container.addEventListener( 'mouseover', function() {

		overRenderer = true;
	}, false );

	container.addEventListener( 'mouseout', function() {

		overRenderer = false;
	}, false );

	window.addEventListener( 'resize', onWindowResize, false );

	getData();


var	guis = [];

var	months = {
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

var	pi = Math.PI,
	pihalf = pi / 2,

	keys = { shift: false, ctrl: false },
	mouse = { x: 0, y: 0 },
	mouseOnDown = { x: 0, y: 0 },

	rotation = { x: pi * 3/2, y: pi / 6.0 },

	target = { x: 0, y: 0 },
	targetOnDown = { x: 0, y: 0 },

	curZoomSpeed = 0,
	zoomSpeed = 50;

	function equalizeGuis() {
	var	e, el = guis.length,
		ewidth = Math.floor( window.innerWidth / el );

		for( e = 0; e < el; e ++ ) {

			guis[ e ].style.width = ewidth + "px";
		}
	}

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

	function guiGo( event ) {
	var node = this,
		curr = guiGo.current || node,
		wait;

		node.addEventListener( 'mouseout', guiOut, false );
		wait = setTimeout( update, 200 );

		function guiOut( event ) {

			clearTimeout( wait );
			cleanEvents();
		}

		function update() {

			removeClass( curr, 'active' );
			addClass( node, 'active' );
			cleanEvents();

			guiGo.current = node;
			updateDisplacement( node.getAttribute( 'data-date' ) );
		}

		function cleanEvents() {

			node.removeEventListener( 'mouseout', guiOut, false );
		}
	}

	function onKeyDown( event ) {
	var	node, date,
		curr = guiGo.current || guis[0];

		switch( event.keyCode ) {

			case 16 : // shift

				keys.shift = true;
			break;
			case 39 : // <

				node = curr.previousSibling;
				update();
			break;
			case 37 : // >

				node = curr.nextSibling;
				update();
			break;
		}

		function update() {

			if( !node ) return false;
			date = node.getAttribute( 'data-date' );
			if( !date ) return false;

			updateDisplacement( date );

			removeClass( curr, 'active' );
			addClass( node, 'active' );
			guiGo.current = node;
		}
	}

	function onKeyUp( event ) {

		switch( event.keyCode ) {

			case 16 : // shift

				keys.shift = false;
			break;
		}
	}

	function onMouseDown( event ) {
	var	vector, ray, intersects;

		event.preventDefault();

		container.addEventListener( 'mousemove', onMouseMove, false );
		container.addEventListener( 'mouseup', onMouseUp, false );
		container.addEventListener( 'mouseout', onMouseOut, false );

		mouseOnDown.x = - event.clientX;
		mouseOnDown.y = event.clientY;

		targetOnDown.x = target.x;
		targetOnDown.y = target.y;

		if( keys.shift ) {

			vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
			projector.unprojectVector( vector, camera );

			ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
			intersects = ray.intersectScene( scene );

			if( intersects.length > 0 ) {
			var	point, coords,
				dir, verts, v0, v1;

				point = intersects[0].point;
				coords = point.sphereCoord( radius );
				console.log( coords );

				verts = hitLineGeom.vertices;
				dir = point.clone().normalize();
				v0 = dir.clone().multiplyScalar( 10000 );
				v1 = dir.clone().multiplyScalar( 350 );

				hitPent.position.copy( point );
				hitPent.lookAt( new THREE.Vector3( 0, 0, 0 ));

				verts[0].position = v0;
				verts[1].position = v1;
				hitLineGeom.__dirtyVertices = true;
			}
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
		if ( overRenderer ) {
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
	var	isopen = toggleAbout.open;

		if( !isopen ) addClass( aboutcon, "show" );
		else aboutcon.className = "";

		toggleAbout.open = !isopen;

		if( !isopen ) container.addEventListener( 'mousedown', toggleAbout, false );
		else container.removeEventListener( 'mousedown', toggleAbout, false );

	}
	toggleAbout.open = false;

	//	clone objects
	function cloneObj( object ) {
	var newObj = ( object instanceof Array ) ? [] : {};

		for ( var i in object ) {

			if ( object[i] && typeof object[i] == "object" ) {

				newObj[i] = object[i].clone();

			} else newObj[i] = object[i];
		}

		return newObj;
	}

	function savePeaks() {
	var	month, sep = ",",
		text = "month,max,min,average\n";

		for( var i in peaks ) {

			if( peaks.hasOwnProperty( i )) {
				month = peaks[ i ];
				text += i + sep + month.max + sep + month.min + sep + month.avg + "\n";
			}
		}

		exportText( text );
	}

	function exportText( text ) {
	var	content = "data:application/plain;charset=utf-8," + escape( text );
	    window.open( content, "data", "width=500,height=10" );
	}


	return wu;

})( WUG || {}, THREE );

