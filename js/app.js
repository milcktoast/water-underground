//	App Wrapper
var App = (function() {
	var	app, data = {},

		dispAtts, dispAttVals,

		camera, scene, renderer, sun,
		ptclSys, matAtts,
		globe = new THREE.Object3D();

//	Init
	(function() {
	var	y, m, yr,
		ambientLight;

		//	Initialize null data object
		for( y = 2002; y <= 2011; y++ ) {

			data[ y ] = yr = [];

			for( m = 0; m < 12; m++ ) {

				yr[ m ] = null;
			}
		}

		//	Initialize scene
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1000, 3000 );
		camera.position.z = 1400;

		scene = new THREE.Scene();

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );

		ambientLight = new THREE.AmbientLight( 0x606060 );
		scene.add( ambientLight );
/*
		sun = new THREE.DirectionalLight( 0xffffff );
		sun.position = camera.position.clone();
		scene.add( sun );
*/
		//	FPS stats
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );

		//	Geometry
	var	latitude, longitude, latPos, longPos, latDir, longDir,
		ptclGeom, ptclMat,

		lineLength,
		radius = 480,

		x0, y0, z0, v0,
		x1, y1, z1, v1;

/*
		ptclMat = new THREE.ParticleBasicMaterial({
			size: 0.5,
			blending: THREE.AdditiveBlending,
			opacity: 0.8,
			transparent: true
		});
		ptclMat.color.setHSV( 1, 0, 0.45 );
*/

		matAtts = {
			displacement : { type: 'f', value: [] }
		}
		ptclMat = new THREE.ShaderMaterial( {
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

		ptclGeom = new THREE.Geometry();
		dispAtts = matAtts.displacement;
		dispAttVals = dispAtts.value;

		for ( latitude = 180; latitude > 0; latitude -- ) {

			latPos = ( latitude ) * 0.0174532925;

			for ( longitude = 360; longitude > 0; longitude -- ) {

				longPos = ( longitude ) * 0.0174532925;

				x0 = radius * Math.cos( longPos ) * Math.sin( latPos );
				z0 = radius * Math.sin( longPos ) * Math.sin( latPos );
				y0 = radius * Math.cos( latPos );

				v0 = new THREE.Vector3( x0, y0, z0 );

				ptclGeom.vertices.push( new THREE.Vertex( v0 ) );
				dispAttVals.push( Math.random() * 50 );

			}

		}

		ptclSys = new THREE.ParticleSystem( ptclGeom, ptclMat );
		ptclSys.dynamic = true;
		//ptclSys.sortParticles = true;

		globe.rotation.x = 0.5;
		globe.rotation.z = 0.5;

		globe.add( ptclSys );
		scene.add( globe );

		animate();

	}());



	function animate() {

		requestAnimationFrame( animate );

		ptclSys.rotation.y += 0.005;
		camera.lookAt( scene.position );
		renderer.render( scene, camera );

		stats.update();

		//TWEEN.update();

	}

	//	load data async
	function loadData( year, month, ndata ) {
		console.log( 'loaded : ', year, month );
		data[ year ][ month - 1 ] = ndata;

		updateDisplacement( year, month );
	}

	function updateDisplacement( year, month ) {
	var	vtl = dispAttVals.length, i,
		dispTween;

		//TWEEN.removeAll();

		for( i = 0; i < vtl; i ++ ) {

			dispAttVals[ i ] = data[ year ][ month - 1 ][ i ];
		}
		dispAtts.needsUpdate = true;

	}

	//	public functions and vars
	app = {
		'loadData' : loadData,
		'renderer' : renderer,
		'geometry' : globe,
		'data' : data
	}

	return app;

}());










