//	WUG Controller
var	WUG = (function() {
	var	guis = [],
		months = {
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
		},

		// DOM
		container, guicon, namecon, aboutcon,
		// Hit sphere ( for UI )
		projector, hitSphere, hitTarget,
		hitLine, hitLineMat, hitPent,
		// Vis 
		lineGroup, matAtts, lineMat, lineGeom, dispAtts, dispAttVals, opacAtts, opacAttVals,

		pi = Math.PI,
		pihalf = pi / 2,

		keys = { shift: false, ctrl: false },
		mouse = { x: 0, y: 0 },
		mouseOnDown = { x: 0, y: 0 },

		rotation = { x: pi * 3/2, y: pi / 6.0 },

		target = { x: 0, y: 0 },
		targetOnDown = { x: 0, y: 0 },

		curZoomSpeed = 0,
		zoomSpeed = 50;


//	Init
	(function() {

		if( !validateWebGL()) return false;

		guicon = document.getElementById( 'gui-container' );
		namecon = document.getElementById( 'date-display' );

		aboutcon = document.getElementById( 'about' );
		document.getElementById( 'about-toggle' ).addEventListener( 'click', toggleAbout, false );
/*
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );
*/

		//	Events
		document.addEventListener( 'keydown', onKeyDown, false );
		document.addEventListener( 'keyup', onKeyUp, false );
		container.addEventListener( 'mousedown', onMouseDown, false );
		container.addEventListener( 'mousewheel', onMouseWheel, false );
		window.addEventListener( 'resize', onWindowResize, false );

		container.addEventListener( 'mouseover', function() {
			overRenderer = true;
		}, false );

		container.addEventListener( 'mouseout', function() {
			overRenderer = false;
		}, false );


		

		getData();

	}());

	//	Check for webGL support
	function validateWebGL() {
	var	gl, elem, link, canvas, error = false;

		gl = window.WebGLRenderingContext;
		if ( !gl ) {
			error = "your browser has no idea what WebGL is :(";
		}

		canvas = document.createElement('canvas');
		gl = canvas.getContext("experimental-webgl");
		if( !gl ) {

			error = "your browser could not initialize WebGL. You probably need to update your drivers or get a new browser.";
		}

		if( error ) {

			elem = document.createElement('div');
			elem.setAttribute( 'id', 'gl-error' );
			elem.innerHTML = "This visualization requires WebGL. However, "+ error +
				"<br /> For more info, check out: <a href='http://get.webgl.org/'>get.webgl.org</a>"+
				"<br /> Also, for a screen-recording of the visualization, view: <a href='http://vimeo.com/32062020'>vimeo.com/32062020</a>";
			document.body.appendChild( elem );

			document.body.setAttribute( 'class', 'error' );

			return false;
		}

		return true;
	}

	function getData() {
	var	s, yr, mo, seg,
		srcBase = "data/GRACE.";

		getData.count = 0;

		for( yr = 2011; yr >= 2002; yr -- ) {

			for( mo = 12; mo > 0; mo -- ) {

				if( yr == 2011 && mo > 5 ) continue;
				if( yr == 2002 && mo < 4 ) break;

				mo = mo.toString().length < 2 ? "0"+ mo : mo;

				seg = document.createElement( 'div' );
				seg.setAttribute( 'class', 'loading' );
				seg.setAttribute( 'data-date', yr +"-"+ mo );

				guicon.appendChild( seg );
				guis.push( seg );

				getData.count ++;

				makeRequest( srcBase + yr +"."+ mo +".json", seg );

			}
		}

		equalizeGuis();

		seg = document.createElement( 'div' );
		seg.setAttribute( 'class', 'loading dummy' );
		guicon.appendChild( seg );

		function makeRequest( src, elem ) {
		var	json, xhr = new XMLHttpRequest();

			xhr.open( 'GET', src, true );
			xhr.onreadystatechange = function( event ) {

				if ( xhr.readyState === 4 ) {

					if ( xhr.status === 200 ) {

						json = JSON.parse( xhr.responseText );

						if( elem ) {

							elem.setAttribute( 'class', 'loaded' );
							elem.addEventListener( 'mouseover', guiGo );
						}

						loadData( json.year, json.month, json.data );
					}
				}
			};

			xhr.setRequestHeader( "Content-Encoding", "gzip" );
			xhr.setRequestHeader( "Content-Type", "application/json" );
			xhr.send( null );

		}

	}

	//	Load data async
	function loadData( year, month, ndata ) {
	var	name = year + '-' + month;

		loadData.count ++;
		parseData( name, ndata );
	//	console.log( loadData.count, getData.count );

		if( loadData.count == 1 ) {

			animate();
			updateDisplacement( name );
		}
		if( loadData.count == getData.count ) document.body.className = "loaded";
	}
	loadData.count = 0;

	//	Update vertex displacement and opacity to new dataset
	function updateDisplacement( name ) {

		TWEEN.removeAll();

	var	vtl = dispAttVals.length, i,

		existData = cloneObj( dispAttVals ),
		existOpacity = cloneObj( opacAttVals ),

		newData = data[ name ],
		newOpacity = nulls[ name ],
		nameParts = name.split('-'),

		diffD = new Array( vtl ),
		diffO = new Array( vtl ),

		stage = { d: 0 },
		dispTween = new TWEEN.Tween( stage ).to( { d:1 }, 300 )
			.easing( TWEEN.Easing.Cubic.EaseOut )
			.onUpdate( update ).onComplete( complete );

		namecon.textContent = months[ nameParts[1] ] +" "+ nameParts[0];

		for( i = 0; i < vtl; i ++ ) {

			diffD[ i ] = ( newData[ i ] - existData[ i ] );
			diffO[ i ] = ( newOpacity[ i ] - existOpacity[ i ] );
		}

		dispTween.start();

		function update() {
		var	cstage = stage.d;

			for( i = 0; i < vtl; i ++ ) {

				dispAttVals[ i ] = existData[ i ] + diffD[ i ] * cstage;
				opacAttVals[ i ] = existOpacity[ i ] + diffO[ i ] * cstage;
			}
			dispAtts.needsUpdate = true;
			opacAtts.needsUpdate = true;

		}
		function complete() {

		//	console.log( 'complete' );
		}

	}

	function parseData( name, ndata ) {
	var	i, il = ndata.length, curr, isNull,
//		tvals = 0, accum = 0,
//		max = 0, min = 100,
		opac = new Array( il );

		for( i = 0; i < il; i ++ ) {

			curr = ndata[ i ];
			isNull = curr === "";

			opac[ i ] = isNull ? 0.0 : 1.0;
/*			if( isNull ) continue;

			max = curr > max ? curr : max;
			min = curr < min ? curr : min;
			accum += curr;

			tvals ++;*/
		}

		data[ name ] = ndata;
		nulls[ name ] = opac;
	/*	peaks[ name ] = {
			'max': max,
			'min': min,
			'avg': Math.round( (accum / tvals) * 100 ) / 100
		};*/
	}

	//	UI
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


})( WUG || {} );










