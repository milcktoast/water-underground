/**
 *	WUG Model / data interaction bits
 */
var WUG = (function( wu ) {

	var data = {}, opacity = {}, peaks = {};
	var loading = 0, loaded = 0;

	/** Load data by year, data available for April 2002 - May 2011
	 */
	var dataRange = [ { "year": 2002, "month": 4 }, { "year": 2011, "month": 5 } ];

	function loadData( year, onStart, onSuccess ) {
		var srcBase = "data/GRACE.";
		var monthName, fullName, srcPath, dateNames = [];
		var y0 = dataRange[0].year, m0 = dataRange[0].month;
		var y1 = dataRange[1].year, m1 = dataRange[1].month;

		for( var month = 12; month > 0; month -- ) {

			// Limit to available range
			if( year == y1 && month > m1 ) continue;
			if( year == y0 && month < m0 ) break;

			monthName = month.toString().length < 2 ? "0"+ month : month;
			fullName = year +"-"+ monthName;
			srcPath = srcBase + year +"."+ month +".json";

			dateNames.push( fullName );

			state.loading ++;
			makeRequest( srcPath, fullName, onSuccess );
		}

		onStart( dateNames );
	}

	/** Request data via xhr
	 */
	function makeRequest( src, name, callback ) {
		var json, xhr = new XMLHttpRequest();

		xhr.open( 'GET', src, true );
		xhr.onreadystatechange = function( event ) {

			if ( xhr.readyState === 4 ) {
				if ( xhr.status === 200 ) {

					loaded ++;
					json = JSON.parse( xhr.responseText );
					parseData( name, json.data );

					if( callback ) callback( name );
				}
			}
		};

		xhr.setRequestHeader( "Content-Encoding", "gzip" );
		xhr.setRequestHeader( "Content-Type", "application/json" );
		xhr.send( null );
	}

	/** Evaluate null data, setup vertex opacity arrays
	 */
	function parseData( name, ndata ) {
		var opac = [];

		for( var i = 0, il = ndata.length; i < il; i ++ ) {

			opac.push( ndata[ i ] === "" ? 0.0 : 1.0 );
		}

		data[ name ] = ndata;
		opacity[ name ] = opac;
	}

	/** Provide animation between data-sets
	 */
	function dataTweenTo( from, to, onupdate ) {

		var edata = data[ from ], eopac = opacity[ from ];
		var ndata = data[ to ], nopac = opacity[ to ];
		var diffD = [], diffO = [], stage = { d: 0 };

		// Calculate difference between future and existing values
		for( var i = 0, il = dispAttVals.length; i < il; i ++ ) {

			diffD[ i ] = ndata[ i ] - edata[ i ];
			diffO[ i ] = nopac[ i ] - eopac[ i ];
		}

		// Stop previous animation, skip to new values
		tween.removeAll();
		var dispTween = new tween.Tween( stage ).to( { d:1 }, 300 ).easing( tween.Easing.Cubic.EaseOut )
		.onUpdate( function() {

			var cstage = stage.d;
			var displacement = [], opacity = [];

			for( i = 0; i < vtl; i ++ ) {

				displacement.push( edata[ i ] + diffD[ i ] * cstage );
				opacity.push( eopac[ i ] + diffO[ i ] * cstage );
			}
			// Apply updated values to geometry
			onupdate( displacement, opacity );

		}).onComplete( function() {

			//console.log( 'complete' );
		});
	}


	function getDataPeaks( name ) {

		if( peaks[ name ] !== undefined ) return peaks[ name ];

		var curr, count;
		var max = 0, min = 100, accum = 0;
		var ndata = data[ name ];

		for( var i = 0, il = edata.length; i < il; i ++ ) {

			curr = ndata[ i ];
			if( curr === "" ) continue;

			max = curr > max ? curr : max;
			min = curr < min ? curr : min;
			accum += curr;

			count ++;
		}

		return peaks[ name ] = {

			'max': max,
			'min': min,
			'avg': Math.round(( accum / count ) * 100 ) / 100
		};
	}

	function savePeaks() {
	var	month, sep = ",",
		text = "month,max,min,average\n";

		for( var i in peaks ) {

			if( peaks.hasOwnProperty( i )) {
				month = peaks[ i ];
				text += i + sep + month.max + sep + month.min + sep + month.avg + "\n";
			}
		}

		exportText( text );
	}

	/** Utility to recursively clone objects and arrays
	 */
	function cloneObj( object ) {
	var newObj = ( object instanceof Array ) ? [] : {};

		for ( var i in object ) {

			// Ignore inherited properties
			if( !object.hasOwnProperty( i )) continue;

			if( object[i] && typeof object[i] == "object" ) {
				newObj[i] = cloneObj( object[i] );

			} else newObj[i] = object[i];
		}

		return newObj;
	}


	/** Exports
	 */
	wu.model = {

		"data": data,
		"peaks": peaks,
		"loadData": loadData,
		"tweenTo": dataTweenTo
	};

	return wu;

})( WUG || {} );

