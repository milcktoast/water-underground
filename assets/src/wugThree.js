/** Additions to THREE.js
 */
(function( THREE ) {

	/**
	 * @author mr.doob / http://mrdoob.com/
	 */

	THREE.SphereGeometry = function ( radius, segmentsWidth, segmentsHeight, phiStart, phiLength, thetaStart, thetaLength ) {

		THREE.Geometry.call( this );

		radius = radius || 50;

		phiStart = phiStart !== undefined ? phiStart : 0;
		phiLength = phiLength !== undefined ? phiLength : Math.PI * 2;

		thetaStart = thetaStart !== undefined ? thetaStart : 0;
		thetaLength = thetaLength !== undefined ? thetaLength : Math.PI;

		var segmentsX = Math.max( 3, Math.floor( segmentsWidth ) || 8 );
		var segmentsY = Math.max( 2, Math.floor( segmentsHeight ) || 6 );

		var x, y, vertices = [], uvs = [];

		for ( y = 0; y <= segmentsY; y ++ ) {

			var verticesRow = [];
			var uvsRow = [];

			for ( x = 0; x <= segmentsX; x ++ ) {

				var u = x / segmentsX;
				var v = y / segmentsY;

				var xpos = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
				var ypos = radius * Math.cos( thetaStart + v * thetaLength );
				var zpos = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

				this.vertices.push( new THREE.Vertex( new THREE.Vector3( xpos, ypos, zpos ) ) );

				verticesRow.push( this.vertices.length - 1 );
				uvsRow.push( new THREE.UV( u, v ) );

			}

			vertices.push( verticesRow );
			uvs.push( uvsRow );

		}

		for ( y = 0; y < segmentsY; y ++ ) {

			for ( x = 0; x < segmentsX; x ++ ) {

				var v1 = vertices[ y ][ x + 1 ];
				var v2 = vertices[ y ][ x ];
				var v3 = vertices[ y + 1 ][ x ];
				var v4 = vertices[ y + 1 ][ x + 1 ];

				var n1 = this.vertices[ v1 ].position.clone().normalize();
				var n2 = this.vertices[ v2 ].position.clone().normalize();
				var n3 = this.vertices[ v3 ].position.clone().normalize();
				var n4 = this.vertices[ v4 ].position.clone().normalize();

				var uv1 = uvs[ y ][ x + 1 ].clone();
				var uv2 = uvs[ y ][ x ].clone();
				var uv3 = uvs[ y + 1 ][ x ].clone();
				var uv4 = uvs[ y + 1 ][ x + 1 ].clone();

				if ( Math.abs( this.vertices[ v1 ].position.y ) == radius ) {

					this.faces.push( new THREE.Face3( v1, v3, v4, [ n1, n3, n4 ] ) );
					this.faceVertexUvs[ 0 ].push( [ uv1, uv3, uv4 ] );

				} else if ( Math.abs( this.vertices[ v3 ].position.y ) ==  radius ) {

					this.faces.push( new THREE.Face3( v1, v2, v3, [ n1, n2, n3 ] ) );
					this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );

				} else {

					this.faces.push( new THREE.Face4( v1, v2, v3, v4, [ n1, n2, n3, n4 ] ) );
					this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3, uv4 ] );

				}

			}

		}

		this.computeCentroids();
		this.computeFaceNormals();

		this.boundingSphere = { radius: radius };

	};

	THREE.SphereGeometry.prototype = new THREE.Geometry();
	THREE.SphereGeometry.prototype.constructor = THREE.SphereGeometry;


	/** Validate WebGL, print help message
	 */
	THREE.validateWebGL = function() {
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

	};

	THREE.Vector3.prototype.sphereCoord = function( sphereRadius ) {
		var lat, lon;

		function toDeg( rad ) {
			return rad * ( 180 / Math.PI );
		}

		function toHalves( num ) {
			return Math.round( num * 2 ) / 2;
		}

		// TODO: these are hacked up a bit, need to resolve original plotting and coordinate system...
		lat = -toDeg( Math.acos( this.y / sphereRadius )) + 90; //theta
		lon = toDeg( Math.atan( this.x / this.z )) - 90 + ( this.z > 0 ? 180 : 0 ); //phi

		lat = toHalves( lat );
		lon = toHalves( lon );

		return [ lat, lon ];
	};

	THREE.Object3D.prototype.lookAt = function ( vector ) {

		this.matrix.lookAt( this.position, vector, this.up );

		if ( this.rotationAutoUpdate ) {

			this.rotation.setRotationFromMatrix( this.matrix );

		}

	};

}( THREE ));