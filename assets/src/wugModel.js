// WUG Model / data interaction bits
var WUG = (function( WUG ) {

var	data = {},
	nulls = {},
	peaks = {},

	loading = 0,
	loaded = 0;


	function getData( year, params ) {
	var	srcBase = "data/GRACE.",
		monthName, fullName, srcPath;

		for( var month = 12; month > 0; month -- ) {

			if( year == 2011 && month > 5 ) continue;
			if( year == 2002 && month < 4 ) break;

			monthName = month.toString().length < 2 ? "0"+ month : month;
			fullName = year +"-"+ monthName;
			srcPath = srcBase + year +"."+ month +".json";

/**			TODO: move to controller
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

/**		TODO: move to controller
		equalizeGuis();
*/
	}

	//	Request data via xhr
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

/*					TODO: move this into controller

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


	function parseData( name, ndata ) {
	var curr, isNull,
		opac = new Array( il );

		for( var i = 0, il = ndata.length; i < il; i ++ ) {

			curr = ndata[ i ];
			isNull = curr === "";

			opac[ i ] = isNull ? 0.0 : 1.0;
		}

		data[ name ] = ndata;
		nulls[ name ] = opac;
	}


	function getDataPeaks( name ) {

		if( peaks[ name ] !== undefined ) return peaks[ name ];

	var	curr, count,
		max = 0, min = 100, accum = 0,
		ndata = data[ name ];

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
			'avg': Math.round( (accum / tvals) * 100 ) / 100
		};
	}


//	Exports
	WUG.data = data;
	WUG.nulls = nulls;


})( WUG || {} );

