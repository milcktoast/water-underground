//	App Wrapper
var App = (function() {
	var	app, data = {},

		container, camera, scene, renderer, overRenderer, ambientLight,
		lineGroup, matAtts, lineMat, lineGeom, globe, dispAtts, dispAttVals,

		PI_HALF = Math.PI / 2,
		mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 },
		rotation = { x: Math.PI * 3/2, y: Math.PI / 6.0 },
		target = { x: 0, y: 0 },
		targetOnDown = { x: 0, y: 0 },
		distance = 10000, distanceTarget = 1900,
		curZoomSpeed = 0,
		zoomSpeed = 50,
		linewidth = 2;

//	Init
	(function() {
	var	latitude, longitude, latPos, longPos, latDir, longDir,
		radius = 480, neutDisp = radius / 2.5,
		x0, y0, z0, v0;


		//	Scene
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 100, 10000 );
		camera.position.z = distance;

		renderer = new THREE.WebGLRenderer();
		renderer.autoClear = false;
		renderer.setClearColorHex(0x000000, 0.0);
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );

		ambientLight = new THREE.AmbientLight( 0x606060 );

		scene = new THREE.Scene();
		scene.add( camera );
		scene.add( ambientLight );

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );


		//	Events
		container.addEventListener('mousedown', onMouseDown, false);
		container.addEventListener('mousewheel', onMouseWheel, false);
		window.addEventListener('resize', onWindowResize, false);

		container.addEventListener('mouseover', function() {
			overRenderer = true;
		}, false);

		container.addEventListener('mouseout', function() {
			overRenderer = false;
		}, false);


		//	Geometry / materials
		lineGeom = new THREE.Geometry();

		matAtts = {
			displacement : { type: 'f', value: [] }
		};

		lineMat = new THREE.ShaderMaterial({

			attributes : matAtts,
			uniforms: {

				"dispX": { type: "f", value: 0 },
				"dispY": { type: "f", value: 0 },
				"dispZ": { type: "f", value: 0 },
				"amount": { type: "f", value: 0 }

			},

			vertexShader: document.getElementById( 'vs' ).textContent,
			fragmentShader: document.getElementById( 'fs' ).textContent,

			depthTest: false
		});

		lineMat.linewidth = linewidth;

		dispAtts = matAtts.displacement;
		dispAttVals = dispAtts.value;


		//	Init globe vertices
		for ( latitude = 180; latitude > 0; latitude -- ) {

			latPos = ( latitude ) * ( Math.PI / 180 );

			for ( longitude = 360; longitude > 0; longitude -- ) {

				longPos = ( longitude ) * ( Math.PI / 180 );

				x0 = radius * Math.cos( longPos ) * Math.sin( latPos );
				z0 = radius * Math.sin( longPos ) * Math.sin( latPos );
				y0 = radius * Math.cos( latPos );

				v0 = new THREE.Vector3( x0, y0, z0 );

				lineGeom.vertices.push( new THREE.Vertex( v0 ) );
				dispAttVals.push( neutDisp );

			}
		}

		lineGroup = new THREE.Line( lineGeom, lineMat );
		lineGroup.dynamic = true;

		globe = new THREE.Object3D();
	//	globe.rotation.x = 0.5;
	//	globe.rotation.z = 0.5;

		globe.add( lineGroup );
		scene.add( globe );

		animate();

	}());



	//	load data async
	function loadData( year, month, ndata ) {
	var	name = year + '-' + month;

		console.log( 'loaded : '+ name );
		data[ name ] = ndata;

		updateDisplacement( name );
	}

	function updateDisplacement( name ) {
	var	vtl = dispAttVals.length, i,
		edata = cloneObj( dispAttVals ),
		ndata = data[ name ],
		stage = { d: 0 },
		diff = [],
		dispTween = new TWEEN.Tween( stage ).to( { d:1 }, 300 )
			.easing( TWEEN.Easing.Cubic.EaseOut )
			.onUpdate( update ).onComplete( complete ).start();

		for( i = 0; i < vtl; i ++ ) {

			diff.push( ndata[ i ] - edata[ i ] );
		}
		//TWEEN.removeAll();

		function update() {
		var	cstage = stage.d;

			for( i = 0; i < vtl; i ++ ) {

				dispAttVals[ i ] = edata[ i ] + diff[ i ] * cstage;
			}
			dispAtts.needsUpdate = true;
		}
		function complete() {

			console.log( 'complete' );
		}

	}

	//	UI
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

		target.y = target.y > PI_HALF ? PI_HALF : target.y;
		target.y = target.y < - PI_HALF ? - PI_HALF : target.y;
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
	console.log( globe.position );
	
	function render() {
		var gpos = globe.position.clone().subSelf( new THREE.Vector3( 0,500,0 ));
		zoom(curZoomSpeed);

		rotation.x += (target.x - rotation.x) * 0.1;
		rotation.y += (target.y - rotation.y) * 0.1;
		distance += (distanceTarget - distance);

		camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
		camera.position.y = distance * Math.sin(rotation.y);
		camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);
/*
		globe.rotation.y = -rotation.x;
		globe.rotation.x = rotation.y;
*/
/*
		console.log( distance,
			camera.position.x,
			camera.position.y,
			camera.position.z,
			rotation.x,
			rotation.y
		);
*/
	//	vector.copy(camera.position);
	//	camera.lookAt( scene.position );

		camera.lookAt( new THREE.Vector3( 0, -camera.position.y / 10 /* + ( 2200 - camera.position.z ) / 4 */, 0 ));

		renderer.clear();
		renderer.render(scene, camera);
	//	renderer.render(sceneAtmosphere, camera);

		stats.update();
		TWEEN.update();
	}


	//	clone objects
 	cloneObj= function( object ) {
	var newObj = (object instanceof Array) ? [] : {};

		for ( i in object ) {

			if ( object[i] && typeof object[i] == "object" ) {

				newObj[i] = object[i].clone();

			} else newObj[i] = object[i];
		}

		return newObj;
	};

	//	public functions and vars
	app = {
		'loadData' : loadData,
		'renderer' : renderer,
		'geometry' : globe,
		'data' : data
	}

	return app;

}());










