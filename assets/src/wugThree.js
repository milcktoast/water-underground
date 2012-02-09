//	Modifications to THREE.js
(function( THREE ) {

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