//	App Wrapper
var App = (function() {
	var	app, data = {},

		camera, scene, renderer, sun,
		ptclSys, matAtts,
		globe = new THREE.Object3D();
		bounce = 0;

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
	var	longitude, latitude,
		ptclGeom, ptclMat,
		inclat, inclon = 0,

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
		var	dispAtt = matAtts.displacement.value;

		for ( longitude = 0; longitude < Math.PI * 2; longitude += Math.PI/180 ) {

			//inclat = 0;

			for ( latitude = 0; latitude < Math.PI; latitude += Math.PI/180 ) {

				x0 = radius * Math.cos( longitude ) * Math.sin( latitude );
				z0 = radius * Math.sin( longitude ) * Math.sin( latitude );
				y0 = radius * Math.cos( latitude );

				//x1 = (radius - lineLength) * Math.cos( longitude ) * Math.sin( latitude );
				//z1 = (radius - lineLength) * Math.sin( longitude ) * Math.sin( latitude );
				//y1 = (radius - lineLength) * Math.cos( latitude );

				v0 = new THREE.Vector3( x0, y0, z0 );
				//v1 = new THREE.Vector3( x1, y1, z1 );

				ptclGeom.vertices.push( new THREE.Vertex( v0 ) );
				dispAtt.push( Math.random() * 50 );

				//inclat ++;
			}

			inclon ++;
		}

		console.log( matAtts );

		ptclSys = new THREE.ParticleSystem( ptclGeom, ptclMat );
		//ptclSys.sortParticles = true;

		globe.rotation.x = 0.5;
		globe.rotation.z = 0.5;

		globe.add( ptclSys );
		scene.add( globe );

		animate();

	}());



	function animate() {

		requestAnimationFrame( animate );

		//ticks.rotation.x += 0.01;
		ptclSys.rotation.y += 0.005;
		//ticks.position.x = Math.sin(bounce) * 100;
		//bounce += 0.01;

		camera.lookAt( scene.position );

		renderer.render( scene, camera );

		stats.update();

	}

	//	load data async
	function loadData( year, month, data ) {
		console.log( 'loaded : ', year, month );
		app.data[ year ][ month ] = data;
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










