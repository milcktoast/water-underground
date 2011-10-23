//	App Wrapper
var App = (function() {
	var	app, data = {},

		camera, scene, renderer, sun, ticks,
		globe = new THREE.Object3D();
		bounce = 0;

//	Init
	(function() {
	var	y, m, yr, 
		ambientLight, lineMat;

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

		camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1400, 3000 );
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
		lineMat = new THREE.LineBasicMaterial({
			opacity: .8, linewidth: 1,
			depthTest: false,
			blending: THREE.AdditiveBlending,
			transparent : true
		});
		lineMat.color.setHSV( 1, 0, 0.45 );

		ticks = new THREE.Object3D;

	var	longitude, latitude, lineGeom, lineLength, line,
		inclat, inclon = 0,

		lineLength = 15,
		lineRadius = 480,

		x0, y0, z0, v0,
		x1, y1, z1, v1;

		lineGeom = new THREE.Geometry();

		for ( longitude = 0; longitude <= Math.PI * 2; longitude += Math.PI/180 ) {

			inclat = 0;

			for ( latitude = 0; latitude <= Math.PI; latitude += Math.PI/180 ) {

				lineLength = Math.random() * 20;
				x0 = ( lineRadius - lineLength ) * Math.cos( longitude ) * Math.sin( latitude );
				z0 = ( lineRadius - lineLength ) * Math.sin( longitude ) * Math.sin( latitude );
				y0 = ( lineRadius - lineLength ) * Math.cos( latitude );

				//x1 = (lineRadius - lineLength) * Math.cos( longitude ) * Math.sin( latitude );
				//z1 = (lineRadius - lineLength) * Math.sin( longitude ) * Math.sin( latitude );
				//y1 = (lineRadius - lineLength) * Math.cos( latitude );

				v0 = new THREE.Vector3( x0, y0, z0 );
				//v1 = new THREE.Vector3( x1, y1, z1 );

				lineGeom.vertices.push( new THREE.Vertex( v0 ) );
				//lineGeom.vertices.push( new THREE.Vertex( v1 ) );

				//line.visible = inclat % 2 == 0 && inclon % 3 == 0;

				//ticks.add( line );

				inclat ++;
				//lineGeometry.vertices.push( new THREE.Vertex( vector ) );						 
			}

			inclon ++;
		}

		line = new THREE.Line( lineGeom, lineMat );
		ticks.add( line );

		globe.rotation.x = 0.5;
		globe.rotation.z = 0.5;

		globe.add( ticks );
		scene.add( globe );

		console.log( ticks );

		animate();

	}());



	function animate() {

		requestAnimationFrame( animate );

		//ticks.rotation.x += 0.01;
		ticks.rotation.y += 0.005;
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
		'data' : data
	}

	return app;

}());










