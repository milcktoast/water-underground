//	Modifications to THREE.js
(function( THREE ) {

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