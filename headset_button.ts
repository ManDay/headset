// ManifoldCAD (https://manifoldcad.org/)

// Generic parameters
const printing_angle = 50
const edge_margin = 1

// Radii
const
r0 = 5, // Slider cutout
r1 = 11, // Turntable, inside; Slider
r2 = 16, // Turntable, outside; Turntable retainer, inside
r3 = 18, // Lever space, inside; Turntable retainer, outside
r4 = 21, // Push button end; Lever space, outside (Lever Axis X)
r5 = 25, // Boundary wall, inside (>= r3 + 2*(r4-r3)
r6 = 27, // Boundary wall, outside
r7 = 40 // Button length

// Indents
const
i0 = 2, // Base plate slider protrusion
i1 = 8, // Button width
i2 = 13, // Turntable retainer (radius)
i3 = 5, // Slider width 
i4 = 3, // Cap retainer base
i5 = 3, // Hinge radius
i6 = 2 // Hinge depth

// Angles
const
alpha = 10, // Button incline
beta = 5 // Unlock incline
/* Note: beta_max = arctan( delta_r/delta_h ) where
* delta_r = sqrt( r5^2 - i1^2 ) - r4
* delta_h = ceiling thicknes */

// Heights, Turntable mount
const
hi0 = 4, // Base plate
hi1 = 6, // Retainer
hi2 = 2, // Guide cutout
hi3 = 6 // Guide height

// Heights, Turntable structure
const
ho0 = 8, // Retention edge and button end
ho1 = 9, // Button notch
ho2 = 16, // Cap bottom
ho3 = 20, // Swivel (Lever Axis Y)
ho4 = 21 // Button top

// Spring retainer
const
rs = 2,
hs = 3

// Button thickness
const hb = 3

import {Manifold, CrossSection, getCircularSegments,only,setMaterial} from 'manifold-3d/manifoldCAD';
const {cylinder, cube, sphere} = Manifold;
const {circle, square, hull} = CrossSection
const PI = Math.PI
const eps = 0.5

function c( obj ) {
 const r = Math.random
 return setMaterial( obj,{ baseColorFactor: [ r( ),r( ),r( ) ] } )
}

function sin( angle ) {
 return Math.sin( angle*PI/180.0 )
}

function cos( angle ) {
 return Math.cos( angle*PI/180.0 )
}

function tan( angle ) {
 return Math.tan( angle*PI/180.0 )
}

function asin( ratio ) {
 return Math.asin( ratio )*180/PI
}

function sector( a,radius ) {
 a = a % 360
 if( a > 180 )
  return circle( radius ).subtract( sector( 360 - a,2*radius ) )
 else
  return circle( radius )
   .subtract(
    square( radius*4 ).translate( [-2*radius,0] ).rotate( a ).add(
     square( radius*4 ).translate( [-2*radius,-4*radius ] )
    ) )
}

function radial_separation( v ) {
 const x = v[ 0 ], y = v[ 1 ]
 const l = Math.sqrt( x*x + y*y )
 return [ x - y/l*edge_margin, y + x/l*edge_margin ]
}

function turntable( ) {
 const tt = new CrossSection( [
  [-eps,hi0-eps],[i2,hi0-eps],
  [i2,hi1+edge_margin],
  [i2+(ho2-hi1-edge_margin)/tan(printing_angle),ho2],
  [-eps,ho2]
 ] ).revolve( ).intersect( cylinder( ho4,r3 ) )
 
 const ret_b = sector( 135,r2 ).rotate( -135/2.0 ).extrude( hi1-hi0+eps ).translate( [0,0,hi0-eps ])
 
 const c_h = ho2-edge_margin
 
 const button_space = cube( [i1+eps,2*r5,2*(ho4+eps)] )
  .translate( [-eps,0,-2*ho4+eps ])
  .trimByPlane( [0,sin(alpha),cos(alpha)],-hb)
  .translate( [0,-(r3+r4)/2,ho3])

 return tt.add( cap_retainer( ).trimByPlane( [ 0,0,-1 ],-ho4 ) ).add( ret_b )
  .subtract( button_space ).subtract(
   slider_base( )
    .translate( [ -i1,0,-c_h ] )
    .trimByPlane( [-sin(printing_angle),0,-cos(printing_angle)],0 )
    .translate( [ i1,0,c_h ] )
  )
  .trimByPlane( [0,0,1],hi0 ).trimByPlane( [ 1,0,0 ],0 )
}

function cap_retainer( ) {
 const protrusion = ( (ho4-ho2)-2*edge_margin)/tan(printing_angle)
 
 const ret_base = new CrossSection( [
  [ -eps,ho2-eps ],
  [ i4,ho2-eps ],
  [ i4,ho2+edge_margin ],
  [ i4+protrusion,ho4-edge_margin ],
  [ i4+protrusion,ho4+eps ],
  [ -eps,ho4+eps ]
 ] ).extrude( r5 ).rotate([90,0,90])
 
 return ret_base.add( ret_base.mirror( [ 0,1,0 ] ) ).intersect( cylinder( ho4*2,r2 ) )
}

function cap_cutout( ) {
 const cap_cutout_depth = r5*cos(printing_angle)
 console.log( cap_cutout_depth )
 const threshold = i4+4
 const upper_edge = threshold+((ho4-ho2)/2-edge_margin )/tan( printing_angle )
 const stabilizer_size = 4*edge_margin
 
 return new CrossSection( [
  [ threshold,0 ],[ r5,0 ],
  [ r5,ho4+eps ],[ r4-i5-edge_margin,ho4+eps ],
  [ r4-i5-edge_margin,(ho4+ho2)/2 ],[ upper_edge,(ho4+ho2)/2 ],
  [ threshold,ho2+edge_margin ]
 ] ).extrude( cap_cutout_depth ).translate( [ 0,0,-cap_cutout_depth ] ).rotate( [ 90,0,-90 ] )
  .add(
   cube( [ stabilizer_size,stabilizer_size,ho4-ho2 ] )
    .translate( [cap_cutout_depth-stabilizer_size,-upper_edge-stabilizer_size,ho2+eps ] )
  )
}

function cap_total( ) {
 return cylinder( ho4-ho0,r5 ).translate( [ 0,0,ho0 ] )
  .add(
   cylinder( ho0-hi0+eps,r4 ).translate( [ 0,0,hi0 ] )
  )
  .subtract( cylinder( ho2,r3 ) )
  .subtract( cap_retainer( ) )
  .trimByPlane( [ 1,0,0 ],i1 )
}

function cap_top( ) {
 return cap_total( )
  .subtract( cap_cutout( ) )
}

function cap_bottom( ) {
 return cap_total( )
  .intersect( cap_cutout( ) )
  .subtract( hinge( ) )
}

function hinge( ) {
 return sector( 90+alpha,i5 ).extrude( 2*(i1+i6) ).translate( [ -r4,-ho3,-i6-i1 ] ).rotate( [ -90,0,90 ] )
}

function slider_base( ) {
 const bottom_margin_y = eps
 const bottom_margin_x = bottom_margin_y/tan(printing_angle)
 const height = i0 + eps
 const top_increment = bottom_margin_x+height/tan(printing_angle)
 const bottom_size = r1
 const top_factor = (bottom_size+top_increment)/bottom_size
 const bottom_offset = bottom_size+i3+bottom_margin_x

 const corners_neg = square( bottom_size ).extrude( bottom_margin_y+height,0,0,[ top_factor,top_factor ] )
  .translate( [ -bottom_offset,-bottom_offset,0 ] )
  
 const radial_neg = cylinder( ho4+2*eps,r1+eps )
  .subtract( cylinder( bottom_margin_y+height,r1+bottom_margin_x,r1-top_increment ) )
  
 const section_mask = cube( [ 2*i3,2*(r1+eps),2*(ho4+eps) ],true )
 
 return cylinder( ho4,r1 )
  .intersect( section_mask.add( section_mask.rotate( [ 0,0,90 ] ) ) )
  .translate( [ 0,0,-ho4+bottom_margin_y+i0 ] )
  .subtract( corners_neg )
  .subtract( corners_neg.rotate( [ 0,0,90 ] ) )
  .subtract( corners_neg.rotate( [ 0,0,180 ] ) )
  .subtract( corners_neg.rotate( [ 0,0,270 ] ) )
  .subtract( radial_neg )
  .rotate( [ 180,0,0 ] )
  .translate( [ 0,0,bottom_margin_y+hi0 ] )
}

function slider( ) {
 return slider_base( )
 .trimByPlane( [ 0,0,-1 ],-hi1 )
 .subtract( cylinder( hi3,r0 ).translate( [ 0,0,hi2 ] ) )
 .subtract( cylinder( hi3,rs ).translate( [0,0,-eps ] ) )
}

function retainer( ) {
 const border = hi1+edge_margin+tan(printing_angle)*(r2-i2)
  
 const theta = asin( button_actor_width( )/r3 )
 const theta_min = Math.min( theta,45/2 )

 const base = new CrossSection( [ 
  [r2,0],[r3+(hi0-2*edge_margin)/tan(printing_angle),0],
  [r3+(hi0-2*edge_margin)/tan(printing_angle),edge_margin],
  [r3,hi0-edge_margin],
  [r3,border],[r2,border],
  [i2,hi1+edge_margin],
  [i2,hi1],[r2,hi1],
 ] )
  .revolve( )
  .intersect( sector( 90-2*theta_min,r5+eps ).rotate( theta_min ).extrude( ho1*2 ) )
  
 const mask = sector( 45/2,r5+eps ).extrude( hi1+eps ).translate( [ 0,0,-eps ] )
  .add( sector( 45/2,r2 ).extrude( ho4 ) )
  
 return base
  .subtract( mask ).subtract( mask.mirror( [ -1,1,0 ] ) )
}

function base_disk( ) {
 const outer = r3+(hi0-2*edge_margin)/tan(printing_angle)
 
 const retainer = new CrossSection( [
  [ r3-eps,-eps ],[ outer,-eps ],
  [ outer,edge_margin ],
  [ r3,hi0-edge_margin ],[ r3-eps,hi0-edge_margin ]
 ] ).revolve( )
 .intersect(
  sector( 135,outer+eps )
   .rotate( -45/2 )
   .extrude( hi0+2*eps )
   .translate( [ 0,0,-eps ] )
 )
  
 const retainer_neg = sector( 45,outer+eps ).rotate( 45/2 ).subtract( circle( eps ) ).extrude( hi3*2 ).translate( [0,0,-eps] )
 
 const neg = retainer_neg
  .add( retainer_neg.mirror( [1,1,0] ) )
  .add( cylinder( hi1-hi0+eps,r2 ).translate( [ 0,0,hi0-eps ] ) )
  .subtract( cylinder( hi0+eps,r2 ).translate( [ 0,0,-eps ] ) )
 
 return cylinder( hi1+eps,r3 ).translate( [ 0,0,-eps ] )
  .add( retainer )
  .add( retainer.rotate( [ 0,0,180 ] ) )
  .trimByPlane( [ 0,0,1 ],0 )
  .subtract( neg )
  .subtract( slider_base( ) )
  .add( cylinder( hi2+hs+eps,rs ).translate( [ 0,0,hi2-eps ] ) )
}

function button_actor_width( ) {
 return i1 - (r6-r5) 
}

function button( ) {
 const rounding = circle( r5 ).translate( [ -r4,0 ] ).revolve( ).rotate( [ 0,90,0 ] )
  .translate( [ 0,-r4,ho3 ] )
  .add( cylinder( 2*(i1+eps),edge_margin ).rotate( [ 0,90,0 ] )
   .translate( [ -i1-eps,-r4,ho3-i5 ] ) )
  .add(
   cylinder( 2*(i1+eps),i5+edge_margin ).rotate( [ 0,90,0 ] )
    .trimByPlane( [ 0,1,0 ],0 )
    .translate( [ -i1-eps,-r4,ho3 ] )
  )
  .hull( )
   
 const top = rounding.add (
  cube( [ 2*(i1+eps),r7+r4,hb+eps ] ).translate( [ -i1-eps,-r4,ho3-hb ] )
 )
  
 const passing = ho3-hb/cos(alpha)-tan(alpha)*(r5+r4)
 const correction = eps*(r4-r5-edge_margin)/(ho3-hb-passing)
 
 const shield = cube( [ 2*(i1+eps),2*r5,2*ho4 ],true ).translate( [ 0,r5,0 ] ).intersect(
  cylinder( ho3-hb-passing+eps,r5 ).translate( [ 0,0,passing] )
  .subtract( cylinder( ho3-hb-passing+2*eps,r5-edge_margin+correction,r4-correction ).translate( [ 0,0,passing-eps ] ) )
 )
 
 const w = r4-r3
 const h = ho3-hi1-edge_margin*2
 const protrusion = (w+h*sin(beta))/cos(beta)-w
 const height = tan(printing_angle)*(protrusion+eps)
 const theta = asin( button_actor_width( )/r3 )
 const theta_min = Math.min( theta,45/2 )
 const ret = new CrossSection( [
  [r3+eps,hi1+2*edge_margin+height],
  [r3-protrusion,hi1+2*edge_margin],
  [r3-protrusion,hi1+edge_margin],[r3+eps,hi1-eps]
 ] ).revolve( )
  .intersect( sector( 2*theta_min,r5 ).rotate( -theta_min-90 ).extrude( ho4 ) )
 const bottom = cylinder( ho3,r4 ).subtract( cylinder( ho3+eps,r3 ) ).trimByPlane( [ 0,0,1 ],hi0 )
  .add( ret )
  .intersect( cube( [ 2*button_actor_width( ),r5,ho4 ] ).translate( [ -button_actor_width( ),-r5,0 ] ) )
  
 const hinge = sector( 180,i5 ).extrude( 2*(i1+i6) ).rotate( [0,90,0] )
  .translate( [ -i1-i6,-r4,ho3 ] ) 
  
 return bottom
  .add( top )
  .add( shield )
  .trimByPlane( [ -1,0,0],-i1 )
  .trimByPlane( [ 1,0,0],-i1 )
  .add( hinge )
  .trimByPlane( [ 0,0,-1],-ho3 )
}

function spring( ) {
 const incline = 4
 const thickness = 0.2
 const radius = rs+2*thickness
 const height = ho2-hi0-2*thickness
 
 const length = height/sin(incline)
 const rotations = length/(2*PI*radius)
 const segments = Math.ceil( rotations*getCircularSegments( radius ) )
 
 function springwarp( v ) {
  const k = v[2]/length
  const phi = k*rotations*360
  const r = radius+v[0]
  const z = k*height-v[1]/cos(incline)
  
  v[0] = cos(phi)*r
  v[1] = sin(phi)*r
  v[2] = z
 }
 
 return circle( thickness ).extrude( length,segments ).warp( springwarp ).translate( [ 0,0,hi0 ] )
}

function rotated_button( angle ) {
 return button( )
  .translate( [ 0,r4,-ho3 ] )
  .rotate( [ -angle,0,0 ] )
  .translate( [ 0,-r4,ho3 ] )
}

export default [
 spring( )
 ,rotated_button( 0 )
 ,slider( )
 ,turntable( )
 ,turntable( ).mirror( [ 1,0,0 ] )
 ,cap_bottom( )
 ,cap_top( )
 ,cap_bottom( ).mirror( [ 1,0,0 ] )
 ,cap_top( ).mirror( [ 1,0,0 ] )
 ,retainer()
 ,retainer().rotate( [ 0,0,180 ] )
 ,base_disk( )
].map( (o) => c(o) )
