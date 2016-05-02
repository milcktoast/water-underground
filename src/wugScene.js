/**	
 *	WUG View / Geometry and materials bits
 *	Import THREE and TWEEN
 */
var WUG = (function( wu, three, tween ) {

	/** Globe geometry & materials
	 */
	var radius = 480;
	var sceneObjects = {};

	/** Establish sphere vertices
	 */
	(function() {
		var geom = new three.Geometry();

		// Material custom attributes, array of floats
		var atts = {

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

			transparent: true,
			depthTest: false
		});

		mat.linewidth = 2;

		// Set spherical array of vertices
		var latitude, longitude, latPos, longPos, v0;
		var dispAttVals = atts.displacement.value;
		var opacAttVals = atts.opacity.value;
		var neutralDisplacement = - radius / 2.5;
		var pi = Math.PI;

		for( latitude = 180; latitude > 0; latitude -- ) {

			latPos = ( latitude ) * ( pi / 180 );

			for( longitude = 360; longitude > 0; longitude -- ) {

				longPos = ( longitude ) * ( pi / 180 );

				v0 = new three.Vector3(
					radius * Math.cos( longPos ) * Math.sin( latPos ), // x
					radius * Math.cos( latPos ), // y
					radius * Math.sin( longPos ) * Math.sin( latPos ) // z
				);

				geom.vertices.push( v0 );
				dispAttVals.push( neutralDisplacement );
				opacAttVals.push( 0.0 );

			}
		}

		sceneObjects.globe = new three.Line( geom, mat );
		sceneObjects.globe.dynamic = true;
		sceneObjects.globe.radius = radius;

	})();


	/** Hit box and region selection indicator
	 */

	// Macro to create regular-convex polygon
	function polyShape( geom, edges, radius ) {
		var x, y, pos, first;
		var step = Math.PI * 2 / edges;

		for( var i = 0; i <= edges; i ++ ) {

			x = Math.cos( step * i ) * radius;
			y = Math.sin( step * i ) * radius;

			pos = i < edges ? new three.Vector3( x, y, 0 ) : first;
			if( i === 0 ) first = pos;

			geom.vertices.push( pos );
		}
	}

	// Hit indicator - normal
	(function() {
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
		geom.vertices = [ new three.Vector3(), new three.Vector3() ];

		sceneObjects.hitLine = new three.Line( geom, mat );

	})();

	// Hit indicator - planar
	(function() {
		var geom = new three.Geometry();
		var mat = new three.ShaderMaterial({

			uniforms: {
				amount : { type: "f", value: 0 }
			},

			vertexShader: document.getElementById( 'vs-pin' ).textContent,
			fragmentShader: document.getElementById( 'fs-pin' ).textContent,

			depthTest: false
		});

		mat.linewidth = 4;
		polyShape( geom, 10, 10 );
		sceneObjects.hitPent = new three.Line( geom, mat );
		sceneObjects.hitPent.scale.set( 0, 0, 0 );

	})();

	// Hit target - spherical mesh
	(function() {
		var sphere = new three.SphereGeometry( radius, 14, 14 );
		var mesh = new three.Mesh( sphere, new three.MeshBasicMaterial() );
		mesh.visible = false;

		sceneObjects.hitTarget = mesh;

	})();


	/** 3D scene
	 */
	var camera = new three.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 100, 10000 );
	var ambientLight = new three.AmbientLight( 0x606060 );
	var scene = new three.Scene();

	scene.add( camera );
	scene.add( ambientLight );
	scene.add( sceneObjects.globe );

	for( var name in sceneObjects ) {

		//if( !sceneObjects[ name ].hasOwnProperty( name )) continue;
		// scene.add( sceneObjects[ name ]);
	}



	/** Publicly accessible
	 */
	wu.view = {

		"scene": scene,
		"camera": camera,
		"objects": sceneObjects
	};

	return wu;

})( WUG || {}, THREE, TWEEN );

