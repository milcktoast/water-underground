/**	
 *	WUG View / Geometry and materials bits
 *	Import THREE and TWEEN
 */
var WUG = (function( wu, three, tween ) {

/**	Globe geometry & materials
 */
	var radius = 480;
	var waterLine, waterAtts;

	// Establish sphere vertices
	(function( line, atts ) {
		var geom = new three.Geometry();

		// Material custom attributes, array of floats
		atts = {

			displacement : { type: 'f', value: [] },
			opacity : { type: 'f', value: [] }
		};

		// Material with custom vertex and fragment shaders
		var mat = new three.ShaderMaterial({

			attributes : atts,
			uniforms: {
				amount : { type: "f", value: 0 }
			},

			vertexShader: document.getElementById( 'vs-geo' ).textContent,
			fragmentShader: document.getElementById( 'fs-geo' ).textContent,

			depthTest: false
		});

		mat.linewidth = 2;

		// Set spherical array of vertices
		var latitude, longitude, latPos, longPos, v0;
		var dispAttVals = atts.displacement.value;
		var opacAttVals = atts.opacity.value;
		var neutralDisplacement = -radius / 2.5;

		for( latitude = 180; latitude > 0; latitude -- ) {

			latPos = ( latitude ) * ( pi / 180 );

			for( longitude = 360; longitude > 0; longitude -- ) {

				longPos = ( longitude ) * ( pi / 180 );

				v0 = new three.Vector3(
					radius * Math.cos( longPos ) * Math.sin( latPos ), // x
					radius * Math.sin( longPos ) * Math.sin( latPos ), // y
					radius * Math.cos( latPos ) // z
				);

				line.vertices.push( new three.Vertex( v0 ) );
				dispAttVals.push( neutralDisplacement );
				opacAttVals.push( 0.0 );

			}
		}

		line = new three.Line( waterLineGeom, waterLineMat );
		line.dynamic = true;

	})( waterLine, waterAtts );


/**	Hit box and region selection indicator
 */
	var hitLine, hitPent;

	//	Macro to create regular-convex polygon
	function polyShape( geom, edges, radius ) {
		var x, y, pos, first;
		var step = Math.PI * 2 / edges;

		for( var i = 0; i <= edges; i ++ ) {

			x = Math.cos( step * i ) * radius;
			y = Math.sin( step * i ) * radius;

			pos = i < edges ? new three.Vector3( x, y, 0 ) : first;
			if( i === 0 ) first = pos;

			geom.vertices.push( new three.Vertex( pos ) );
		}
	}

	//	Hit indicator - normal
	(function( line ) {
		var geom = new three.Geometry();
		var mat = new three.ShaderMaterial({

			uniforms: {
				amount : { type: "f", value: 0 }
			},

			vertexShader: document.getElementById( 'vs-pin' ).textContent,
			fragmentShader: document.getElementById( 'fs-pin' ).textContent,

			depthTest: false
		});

		mat.linewidth = 2;
		geom.vertices = [ new three.Vertex(), new three.Vertex() ];

		line = new three.Line( geom, mat );

	})( hitLine );

	//	Hit indicator - planar
	(function( line ) {
		var geom = new three.Geometry();
		var mat = new three.ShaderMaterial({

			uniforms: {
				amount : { type: "f", value: 0 }
			},

			vertexShader: document.getElementById( 'vs-pin' ).textContent,
			fragmentShader: document.getElementById( 'fs-pin' ).textContent,

			depthTest: false
		});

		polyShape( geom, 10, 10 );
		line = new three.Line( geom, mat );

	})( hitPent );

	//	Hit target - spherical mesh
	(function( mesh ) {
		var sphere = new three.SphereGeometry( radius, 14, 14 );

		mesh = new three.Mesh( sphere, new three.MeshBasicMaterial() );
		mesh.visible = false;

	})( hitTarget );


/**	3D scene
 */
	var container = document.createElement( 'div' );
	document.body.appendChild( container );

	var camera = new three.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 100, 10000 );
	camera.position.z = distance;

	var ctarget = new three.Vector3( 0, 0, 0 );

	var projector = new three.Projector();

	var renderer = new three.WebGLRenderer();
	renderer.autoClear = false;
	renderer.setClearColorHex( 0x000000, 0.0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	var ambientLight = new three.AmbientLight( 0x606060 );

	// Create and populate
	var scene = new three.Scene();

	scene.add( camera );
	scene.add( ambientLight );

	scene.add( waterLine );
	scene.add( hitLine );
	scene.add( hitPent );
	scene.add( hitTarget );


	/** Update vertex displacement and opacity to new dataset
	 */
	function updateDisplacement( name ) {

		var edata = cloneObj( dispAttVals ), eopac = cloneObj( opacAttVals );
		var ndata = wu.data[ name ], nopac = wu.opacity[ name ];

		var diffD = [], diffO = [], stage = { d: 0 };
		var nameParts = name.split('-');

		namecon.textContent = months[ nameParts[1] ] +" "+ nameParts[0];

		// Calculate difference between future and existing values
		for( var i = 0, il = dispAttVals.length; i < il; i ++ ) {

			diffD[ i ] = ndata[ i ] - edata[ i ];
			diffO[ i ] = nopac[ i ] - eopac[ i ];
		}

		// Animate to new values
		var dispTween = new tween.Tween( stage ).to( { d:1 }, 300 ).easing( tween.Easing.Cubic.EaseOut )
		.onUpdate( function() {
			var cstage = stage.d;

			for( i = 0; i < vtl; i ++ ) {

				dispAttVals[ i ] = existData[ i ] + diffD[ i ] * cstage;
				opacAttVals[ i ] = existOpacity[ i ] + diffO[ i ] * cstage;
			}

			waterAtts.displacement.needsUpdate = true;
			waterAtts.opacity.needsUpdate = true;

		}).onComplete( function() {

			//console.log( 'complete' );
		});

		tween.removeAll();
		dispTween.start();

	}

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

		tween.update();
	}

	//	Publicly accessible
	wu.animate = animate;
	wu.globe = {

		"displacement": waterAtts.displacement,
		"opacity": waterAtts.opacity
	};

	return wu;

})( WUG || {}, THREE, TWEEN );

