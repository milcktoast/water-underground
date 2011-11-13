//	App Wrapper
var GlobeApp = (function() {
	var	data = {},
		nulls = {},

		guis = new Array(),
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

		container, guicon, namecon, camera, scene, renderer, overRenderer, ambientLight,
		lineGroup, matAtts, lineMat, lineGeom, globe, dispAtts, dispAttVals, opacAtts, opacAttVals,

		pi = Math.PI,
		pihalf = pi / 2,

		mouse = { x: 0, y: 0 },
		mouseOnDown = { x: 0, y: 0 },

		rotation = { x: pi * 3/2, y: pi / 6.0 },

		target = { x: 0, y: 0 },
		targetOnDown = { x: 0, y: 0 },

		distance = 10000,
		distanceTarget = 1900,

		curZoomSpeed = 0,
		zoomSpeed = 50,

		linewidth = 2;


//	Init
	(function() {
	var	latitude, longitude, latPos, longPos,
		x0, y0, z0, v0,

		radius = 480, 
		neutDisp = radius / 2.5;

		guicon = document.getElementById( 'gui-container' );
		namecon = document.getElementById( 'year-display' );

		//	Scene
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 100, 10000 );
		camera.position.z = distance;

		renderer = new THREE.WebGLRenderer();
		renderer.autoClear = false;
		renderer.setClearColorHex( 0x000000, 0.0 );
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );

		ambientLight = new THREE.AmbientLight( 0x606060 );

		scene = new THREE.Scene();
		scene.add( camera );
		scene.add( ambientLight );
/*
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );
*/

		//	Events
		container.addEventListener( 'mousedown', onMouseDown, false );
		container.addEventListener( 'mousewheel', onMouseWheel, false );
		window.addEventListener( 'resize', onWindowResize, false );

		container.addEventListener( 'mouseover', function() {
			overRenderer = true;
		}, false );

		container.addEventListener( 'mouseout', function() {
			overRenderer = false;
		}, false );


		//	Geometry / materials
		lineGeom = new THREE.Geometry();

		matAtts = {
			displacement : { type: 'f', value: [] },
			opacity : { type: 'f', value: [] }
		};

		lineMat = new THREE.ShaderMaterial({

			attributes : matAtts,
			uniforms: {

				amount : { type: "f", value: 0 }

			},

			vertexShader: document.getElementById( 'vs' ).textContent,
			fragmentShader: document.getElementById( 'fs' ).textContent,

			depthTest: false
		});

		lineMat.linewidth = linewidth;

		dispAtts = matAtts.displacement;
		dispAttVals = dispAtts.value;
		opacAtts = matAtts.opacity;
		opacAttVals = opacAtts.value;


		//	Init globe vertices
		for ( latitude = 180; latitude > 0; latitude -- ) {

			latPos = ( latitude ) * ( pi / 180 );

			for ( longitude = 360; longitude > 0; longitude -- ) {

				longPos = ( longitude ) * ( pi / 180 );

				x0 = radius * Math.cos( longPos ) * Math.sin( latPos );
				z0 = radius * Math.sin( longPos ) * Math.sin( latPos );
				y0 = radius * Math.cos( latPos );

				v0 = new THREE.Vector3( x0, y0, z0 );

				lineGeom.vertices.push( new THREE.Vertex( v0 ) );
				dispAttVals.push( neutDisp );
				opacAttVals.push( 0.0 );

			}
		}

		lineGroup = new THREE.Line( lineGeom, lineMat );
		lineGroup.dynamic = true;

		globe = new THREE.Object3D();

		globe.add( lineGroup );
		scene.add( globe );

		getData();
		animate();

	}());


	function getData() {
	var	s, yr, mo, seg,
		srcBase = "data/GRACE.";

		getData.count = 0;

		for( yr = 2011; yr >= 2002; yr -- ) {

			for( mo = 12; mo > 2; mo -- ) {

				if( yr == 2011 && mo > 5 ) continue;
				if( yr == 2002 && mo < 4 ) break;

				mo = new String( mo );
				mo = mo.length < 2 ? "0"+ mo : mo;

				seg = document.createElement( 'div' );
				seg.setAttribute( 'class', 'loading' );
				seg.setAttribute( 'data-date', yr +"-"+ mo );

				guicon.appendChild( seg );
				guis.push( seg );

				equalizeGuis();

				getData.count ++;

				makeRequest( srcBase + yr +"."+ mo +".json", seg );
				//data[ yr + "-" + mo ] = { src : srcBase + yr +"."+ mo +".json" };

			}

		}

		function makeRequest( src, elem ) {
		var	json, xhr = new XMLHttpRequest();

			xhr.open( 'GET', src, true );
			xhr.onreadystatechange = function( event ) {

				if ( xhr.readyState === 4 ) {

					if ( xhr.status === 200 ) {

						json = JSON.parse( xhr.responseText );
						elem.setAttribute( 'class', 'loaded' );
						elem.addEventListener( 'mouseover', onClickyClick );

						loadData( json.year, json.month, json.data );
					}
				}
			};

			xhr.send( null );

		}

	}

	//	Load data async
	function loadData( year, month, ndata ) {
	var	name = year + '-' + month;

		loadData.count ++;
		data[ name ] = ndata;
		nulls[ name ] = evaluateNull( ndata );
		console.log( loadData.count, getData.count );

		if( name == '2011-05' ) updateDisplacement( name );
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

		namecon.innerHTML = months[ nameParts[1] ] +" "+ nameParts[0];

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

			console.log( 'complete' );
		}

	}

	function evaluateNull( data ) {
	var	i, il = data.length,
		ndata = new Array( il );

		for( i = 0; i < il; i ++ ) {

			ndata[ i ] = data[ i ] == null ? 0.0 : 1.0;
		}

		return ndata;
	}

	//	UI
	function equalizeGuis() {
	var	e, el = guis.length,
		ewidth = Math.ceil( window.innerWidth / el );

		for( e = 0; e < el; e ++ ) {

			guis[ e ].style.width = ewidth + "px";
		}
	}

	function onClickyClick( event ) {

		updateDisplacement( this.getAttribute( 'data-date' ) );
	}

	function onMouseDown( event ) {
		event.preventDefault();

		container.addEventListener( 'mousemove', onMouseMove, false );
		container.addEventListener( 'mouseup', onMouseUp, false );
		container.addEventListener( 'mouseout', onMouseOut, false );

		mouseOnDown.x = - event.clientX;
		mouseOnDown.y = event.clientY;

		targetOnDown.x = target.x;
		targetOnDown.y = target.y;

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

	function zoom( delta ) {
		distanceTarget -= delta;
		distanceTarget = distanceTarget > 2200 ? 2200 : distanceTarget;
		distanceTarget = distanceTarget < 1200 ? 1200 : distanceTarget;
	}

	function animate() {
		requestAnimationFrame( animate );
		render();
	}

	function render() {

		zoom( curZoomSpeed );

		rotation.x += ( target.x - rotation.x ) * 0.1;
		rotation.y += ( target.y - rotation.y ) * 0.1;
		distance +=  ( distanceTarget - distance );

		camera.position.x = distance * Math.sin( rotation.x ) * Math.cos(rotation.y);
		camera.position.y = distance * Math.sin( rotation.y );
		camera.position.z = distance * Math.cos( rotation.x ) * Math.cos(rotation.y);

		camera.lookAt( new THREE.Vector3( 0, -camera.position.y / 10, 0 ));

		renderer.clear();
		renderer.render( scene, camera );

	//	stats.update();
		TWEEN.update();
	}


	//	clone objects
	function cloneObj( object ) {
	var newObj = ( object instanceof Array ) ? [] : {};

		for ( i in object ) {

			if ( object[i] && typeof object[i] == "object" ) {

				newObj[i] = object[i].clone();

			} else newObj[i] = object[i];
		}

		return newObj;
	};

	//	public functions and vars
	return {
		'loadData' : loadData,
		'updateDisplacement' : updateDisplacement,
		'renderer' : renderer,
		'geometry' : globe,
		'data' : data
	};


}());










