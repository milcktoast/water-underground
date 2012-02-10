/**
 *	WUG Model / data interaction bits
 */
var WUG = (function( wu ) {

	var	data = {}, opacity = {}, peaks = {};
	var loading = 0, loaded = 0;

	/** Load data by year, data available for April 2002 - May 2011
	 */
	function getData( year, params ) {
		var srcBase = "data/GRACE.";
		var monthName, fullName, srcPath;

		for( var month = 12; month > 0; month -- ) {

			if( year == 2011 && month > 5 ) continue;
			if( year == 2002 && month < 4 ) break;

			monthName = month.toString().length < 2 ? "0"+ month : month;
			fullName = year +"-"+ monthName;
			srcPath = srcBase + year +"."+ month +".json";
/**
			TODO: move to controller
			seg = document.createElement( 'div' );
			seg.setAttribute( 'class', 'loading' );
			seg.setAttribute( 'data-date', year +"-"+ month );

			guicon.appendChild( seg );
			guis.push( seg );
*/
			loading ++;

			makeRequest( srcPath, fullName, params.onsuccess );
			if( params.onstart ) params.onstart( fullName );
		}
/**
		TODO: move to controller
		equalizeGuis();
*/
	}

	/** Request data via xhr
	 */
	function makeRequest( src, name, callback ) {
	var	xhr = new XMLHttpRequest(),
		json;

		xhr.open( 'GET', src, true );
		xhr.onreadystatechange = function( event ) {

			if ( xhr.readyState === 4 ) {

				if ( xhr.status === 200 ) {

					loaded ++;

					json = JSON.parse( xhr.responseText );

					parseData( name, json.data );

					if( callback ) {

						callback({ "name": name, "loaded": loaded, "loading": loading });
					}
/**
					TODO: move this into controller

					if( elem ) {

						elem.setAttribute( 'class', 'loaded' );
						elem.addEventListener( 'mouseover', guiGo );
					}

					if( loaded == loading ) document.body.className = "loaded";
					if( loaded == 1 ) {

						animate();
						updateDisplacement( name );
					}
*/
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


//	Exports
	wu.data = data;
	wu.opacity = opacity;

	return wu;

})( WUG || {} );

