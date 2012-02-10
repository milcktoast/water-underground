//	WUG View / Geometry and materials bits
var WUG = (function( WUG, THREE, TWEEN ) {


/**	Globe geometry & materials
 */
var	radius = 480,
	waterLine, waterAtts;

	//	Establish sphere vertices
	(function( line, atts ) {
	var geom = new THREE.Geometry();

	//	Material custom attributes, array of floats
		atts = {

			displacement : { type: 'f', value: [] },
			opacity : { type: 'f', value: [] }
		};

	//	Material with custom vertex and fragment shaders
	var	mat = new THREE.ShaderMaterial({

			attributes : atts,
			uniforms: {
				amount : { type: "f", value: 0 }
			},

			vertexShader: document.getElementById( 'vs-geo' ).textContent,
			fragmentShader: document.getElementById( 'fs-geo' ).textContent,

			depthTest: false
		});

		mat.linewidth = 2;

	//	Set initial vertices
	var	latitude, longitude,
		latPos, longPos, v0,

		dispAttVals = atts.displacement.value,
		opacAttVals = atts.opacity.value,
		neutralDisplacement = -radius / 2.5;

		for( latitude = 180; latitude > 0; latitude -- ) {

			latPos = ( latitude ) * ( pi / 180 );

			for( longitude = 360; longitude > 0; longitude -- ) {

				longPos = ( longitude ) * ( pi / 180 );

				v0 = new THREE.Vector3(
					radius * Math.cos( longPos ) * Math.sin( latPos ), // x
					radius * Math.sin( longPos ) * Math.sin( latPos ), // y
					radius * Math.cos( latPos ) // z
				);

				line.vertices.push( new THREE.Vertex( v0 ) );
				dispAttVals.push( neutDisp );
				opacAttVals.push( 0.0 );

			}
		}

		line = new THREE.Line( waterLineGeom, waterLineMat );
		line.dynamic = true;

	})( waterLine, waterAtts );


/**	Hit box and region selection indicator
 */
var	hitLine, hitPent;

	//	Macro to create regular-convex polygon
	function polyShape( geom, edges, radius ) {
	var	i, x, y,
		pos, first,
		step = Math.PI * 2 / edges;

		for( i = 0; i <= edges; i ++ ) {

			x = Math.cos( step * i ) * radius;
			y = Math.sin( step * i ) * radius;

			pos = i < edges ? new THREE.Vector3( x, y, 0 ) : first;
			if( i === 0 ) first = pos;

			geom.vertices.push( new THREE.Vertex( pos ));
		}
	}

	//	Hit indicator - normal
	(function( line ) {
	var	geom = new THREE.Geometry(),
		mat = new THREE.ShaderMaterial({

			uniforms: {
				amount : { type: "f", value: 0 }
			},

			vertexShader: document.getElementById( 'vs-pin' ).textContent,
			fragmentShader: document.getElementById( 'fs-pin' ).textContent,

			depthTest: false
		});

		mat.linewidth = 2;
		geom.vertices = [ new THREE.Vertex(), new THREE.Vertex() ];

		line = new THREE.Line( geom, mat );

	})( hitLine );

	//	Hit indicator - planar
	(function( line ) {
	var geom = new THREE.Geometry(),
		mat = new THREE.ShaderMaterial({

			uniforms: {
				amount : { type: "f", value: 0 }
			},

			vertexShader: document.getElementById( 'vs-pin' ).textContent,
			fragmentShader: document.getElementById( 'fs-pin' ).textContent,

			depthTest: false
		});

		polyShape( geom, 10, 10 );
		line = new THREE.Line( geom, mat );

	})( hitPent );

	//	Hit target - spherical mesh
	(function( mesh ) {
	var	sphere = new THREE.SphereGeometry( radius, 14, 14 );

		mesh = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial() );
		mesh.visible = false;

	})( hitTarget );


/**	3D scene
 */
var	container,
	camera, ctarget,
	scene,
	renderer, overRenderer,
	projector,
	ambientLight;

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 100, 10000 );
	camera.position.z = distance;
	ctarget = new THREE.Vector3( 0, 0, 0 );

	projector = new THREE.Projector();

	renderer = new THREE.WebGLRenderer();
	renderer.autoClear = false;
	renderer.setClearColorHex( 0x000000, 0.0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	ambientLight = new THREE.AmbientLight( 0x606060 );

	// Create and populate
	scene = new THREE.Scene();

	scene.add( camera );
	scene.add( ambientLight );

	scene.add( waterLine );
	scene.add( hitLine );
	scene.add( hitPent );
	scene.add( hitTarget );


/**	Anmimation / rendering
 */
var	distance = 10000,
	distanceTarget = 1900;

	function animate() {

		requestAnimationFrame( animate );
		update();
		render();
	}

	function update() {
	var	counter = update.counter || 0;

		counter = counter < pi ? counter + pi / 128 : 0;
		update.counter = counter;
	}

	function zoom( delta ) {

		distanceTarget -= delta;
		distanceTarget = distanceTarget > 2200 ? 2200 : distanceTarget;
		distanceTarget = distanceTarget < 1200 ? 1200 : distanceTarget;
	}

	function render() {
	var	scale = Math.sin( update.counter );

		zoom( curZoomSpeed );

		hitPent.scale.set( scale, scale, 1 );

		rotation.x += ( target.x - rotation.x ) * 0.1;
		rotation.y += ( target.y - rotation.y ) * 0.1;
		distance += ( distanceTarget - distance );

		camera.position.x = distance * Math.sin( rotation.x ) * Math.cos(rotation.y);
		camera.position.y = distance * Math.sin( rotation.y );
		camera.position.z = distance * Math.cos( rotation.x ) * Math.cos(rotation.y);

		ctarget.y = -camera.position.y / 10; 

		camera.lookAt( ctarget );

		renderer.clear();
		renderer.render( scene, camera );

		//stats.update();
		TWEEN.update();
	}

	//	Publicly accessible
	WUG.animate = animate;
	WUG.globe = {

		"displacement": waterAtts.displacement,
		"opacity": waterAtts.opacity
	};

	return WUG;

})( WUG || {}, THREE, TWEEN );

