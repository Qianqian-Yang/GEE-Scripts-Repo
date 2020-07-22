/* 
resample from landsat 30m resolution to 500m. This is useful when comparing image datasets at different scales, 
for example 30-meter pixels from a Landsat-based product to coarse pixels (higher scale) from a MODIS-based product.
Please keep an eye on the comparison between resample method and average aggregation
reference link:https://gis.stackexchange.com/questions/316596/how-can-i-resample-a-image-or-imagecollection-to-a-higher-resolution-in-google-e
Tips:
If the original image with incorrect projection after some calculation such as mean, max and so on.
You have to reproject it using the suitable projection then using resample method.
*/

var landsat = ee.Image('LANDSAT/LC08/C01/T1_TOA/LC08_044034_20160323');
var crs = landsat.select('B4').projection()
// Set display and visualization parameters.
Map.setCenter(-122.37383, 37.6193, 15);
var visParams = {bands: ['B4', 'B3', 'B2'], max: 0.3};

// Display the Landsat image using the default nearest neighbor resampling.
// when reprojecting to Mercator for the Code Editor map.
Map.addLayer(landsat, visParams, 'original image');

// Force the next reprojection on this image to use bicubic resampling.
var resampled1 = landsat.reproject({
'crs': crs,
'scale': 500.0});

var resampled2 = landsat.resample('bicubic').reproject({
'crs': crs,
'scale': 500.0});

// Load a MODIS EVI image.
var modis = ee.Image(ee.ImageCollection('MODIS/006/MOD13A1').first())
    .select('EVI');

// Display the EVI image near La Honda, California.
Map.setCenter(-122.3616, 37.5331, 12);
Map.addLayer(modis, {min: 2000, max: 5000}, 'MODIS EVI');


// Display the Landsat image using bicubic resampling.
Map.addLayer(resampled1, visParams, 'nearest neighbor resampled');
Map.addLayer(resampled2, visParams, 'cubic resampled');


///////////////////////////******************section two********************////////////////////////////
///////--------------------------comparison with average aggregation----------------------
// Get information about the MODIS projection.
var modisProjection = modis.projection();
print('MODIS projection:', modisProjection);

// Load and display forest cover data at 30 meters resolution.
var forest = ee.Image('UMD/hansen/global_forest_change_2015')
    .select('treecover2000');
Map.addLayer(forest, {max: 80}, 'forest cover 30 m');

// Get the forest cover data at MODIS scale and projection.
var forestMean = forest
    // Force the next reprojection to aggregate instead of resampling.
    .reduceResolution({
      reducer: ee.Reducer.mean(),
      maxPixels: 1024
    })
    // Request the data at the scale and projection of the MODIS image.
    .reproject({
      crs: modisProjection
    });

// Display the aggregated, reprojected forest cover data.
Map.addLayer(forestMean, {max: 80}, 'forest cover at MODIS scale');

//////////////////////////********section3********///////////////////////////
//////-------------resample the image with incorrect projection----------------
var treeCanopyCoverVis = {
  min: 0.0,
  max: 100.0,
  palette: ['ffffff', 'afce56', '5f9c00', '0e6a00', '003800'],
};
var GFCC2000 = ee.ImageCollection("NASA/MEASURES/GFCC/TC/v3")
              .filter(ee.Filter.date('2000-01-01', '2000-12-31'))
              .select('tree_canopy_cover')
             
var GFCC2000Projection = GFCC2000.first().projection();
print('GFCC2000Projection:', GFCC2000Projection);               
var GFCC2000 = ee.ImageCollection("NASA/MEASURES/GFCC/TC/v3")
              .filter(ee.Filter.date('2000-01-01', '2000-12-31'))
              .select('tree_canopy_cover')
              .mean()
var GFCC2000Projection = GFCC2000.projection();
print('GFCC2000Projection:', GFCC2000Projection); 

var GFCC2005 = ee.ImageCollection("NASA/MEASURES/GFCC/TC/v3")
              .select('tree_canopy_cover')
              .filterDate('2005-01-01')
              .mean()
var GFCC2010 = ee.ImageCollection("NASA/MEASURES/GFCC/TC/v3")
              .select('tree_canopy_cover')
              .filterDate('2010-01-01')
              .mean()
var GFCC2015 = ee.ImageCollection("NASA/MEASURES/GFCC/TC/v3")
              .select('tree_canopy_cover')
              .filterDate('2015-01-01').mean()
          
   
var hansenforest = ee.Image('UMD/hansen/global_forest_change_2015')
    .select('treecover2000');
print('forest',hansenforest)
var forestProjection = hansenforest.projection()   
print('forestProjection:',forestProjection);   

var GFCC2015Repro = GFCC2015
  .reproject({
  crs: forestProjection
  })
var GFCC2015ReproBicubic = GFCC2015Repro
  .resample('bicubic')
  .reproject({
    crs: 'SR-ORG:6974',
    scale:500
  })

var GFCC2015ReproMean = GFCC2015Repro
    // Force the next reprojection to aggregate instead of resampling.
    .reduceResolution({
      reducer: ee.Reducer.mean(),
      maxPixels: 1024
    })
    // Request the data at the scale and projection of the MODIS image.
    .reproject({
      crs: 'SR-ORG:6974',
      scale:500
    });
var GFCC2015Projection= GFCC2015Repro.projection()   
print('GFCC2015Projection:', GFCC2015Projection);   
Map.setCenter(-122.3616, 37.5331, 12);

Map.addLayer(GFCC2000,treeCanopyCoverVis,'GFCC2000');
Map.addLayer(GFCC2005,treeCanopyCoverVis,'GFCC2005');
Map.addLayer(GFCC2010,treeCanopyCoverVis,'GFCC2010');
Map.addLayer(GFCC2015,treeCanopyCoverVis,'GFCC2015');
Map.addLayer(GFCC2015ReproBicubic,treeCanopyCoverVis,'GFCC2015ReproBicubic');
Map.addLayer(GFCC2015ReproMean,treeCanopyCoverVis,'GFCC2015ReproMean');

