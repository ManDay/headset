// ManifoldCAD (https://manifoldcad.org/)

// Generic parameters
const printing_angle = 50
const edge_margin = 1
const sg = 0.2 // Slip-Gap
const resolution = 64

// Radii
const
r0 = 5, // Slider cutout
r1 = 11, // Turntable, inside; Slider
r2 = 16, // Turntable, outside; Turntable retainer, inside
r3 = 18, // Lever space, inside; Turntable retainer, outside
r4 = 21, // Push button end; Lever space, outside (Lever Axis X)
r5 = 25, // Boundary wall, inside (>= r3 + 2*(r4-r3)
r6 = 27, // Boundary wall, outside
r8 = 70 // Button length

// Indents
const
i0 = 1, // Base plate slider protrusion
i1 = 8, // Button width
i2 = 13, // Turntable retainer (radius)
i3 = 5, // Slider width 
i4 = 3, // Cap retainer base
i5 = 3, // Hinge radius
i6 = 2 // Hinge depth

// Angles
const
alpha = 9.5, // Button incline
beta = alpha, // Unlock incline
gamma = 70 // Chassis main retainer angle
/* Note: beta_max = arctan( delta_r/delta_h ) where
* delta_r = sqrt( r5^2 - i1^2 ) - r4
* delta_h = ceiling thicknes */

// Heights, Turntable mount
const
hi0 = 4, // Base plate
hi1 = 6, // Retainer
hi2 = 4, // Guide cutout floor
hi3 = 6 // Guide height

// Heights, Turntable structure
const
ho0 = 8, // Retention edge and pushswitch upper margin
ho2 = 16, // Cap bottom
ho3 = 20, // Swivel (Lever Axis Y)
ho4 = 21 // Button top

// Spring retainer
const
rs = 2,
hs = 3

// Button thickness
const hb = 3

// Pushswitch parameters
const
r7 = r5, // Wall front
hs0 = 6.5, // Meet against wall
hs1 = 17.5, // Maximal height
rs0 = 2, // Meet radius
rs1 = 3.25, // Maximal radius
hs2 = hi0+rs1+0, // Altitude
hs3 = 2, // Retainer wall
phi = 8 // Incline

// Cable parameters
const
rc0 = 1.5, // Mic cable radius
rc1 = 1.5, // Speaker cable radius
rc2 = 4 // Inlet cable radius

// Chassis geometry
const
rf = 4, // Fillet radius
rr2 = 10, // Main retainer cutout
rr1 = 8, // Inner retainer cutout
rr0 = 6 // Retainer radius

const
hc = (ho2+hi0)/2 // Cable holes altitude

// Cable hole positions
const
 inlet_dist = 2.2*rr2,
 speakers_dist = 3.4*rr2,
 mic_dist = 1.7*rr2

import {Manifold, CrossSection, getCircularSegments,only,setMaterial} from 'manifold-3d/manifoldCAD';
const {cylinder, cube, sphere} = Manifold;
const {circle, square, hull} = CrossSection
const PI = Math.PI
const eps = 0.5

setCircularSegments( resolution )

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

function atan( ratio ) {
 return Math.atan( ratio )*180/PI
}

const ho1 = ho3-cos(alpha)*hb-tan(alpha)*(r6+r4) // Button notch

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

function button_space( ) {
 return cube( [i1+eps,2*r6,2*(ho4+eps)] )
  .translate( [-eps,-r6+r4,-2*ho4+eps ])
  .trimByPlane( [0,sin(alpha),cos(alpha)],-hb)
  .translate( [0,-r4,ho3])
}


function radial_separation( v ) {
 const x = v[ 0 ], y = v[ 1 ]
 const l = Math.sqrt( x*x + y*y )
 return [ x - y/l*edge_margin, y + x/l*edge_margin ]
}

function turntable( ) {
 const r3_sg = r3 + sg, hi0_sg = hi0 + sg, r2_sg = r2 - sg
 
 const tt = new CrossSection( [
  [-eps,hi0_sg-eps],[i2,hi0_sg-eps],
  [i2,hi1+edge_margin],
  [i2+(ho2-hi1-edge_margin)/tan(printing_angle),ho2],
  [-eps,ho2]
 ] ).revolve( ).intersect( cylinder( ho4,r3_sg ) )
 
 const ret_b = sector( 135,r2_sg ).rotate( -135/2.0 ).extrude( hi1-hi0_sg+eps ).translate( [0,0,hi0_sg-eps ])
 
 const c_h = ho2-edge_margin

 return tt.add( cap_retainer( ).trimByPlane( [ 0,0,-1 ],-ho4 ) ).add( ret_b )
  .subtract( button_space( ) ).subtract(
   slider_base( r1+sg,i3+sg )
    .translate( [ -i1,0,-c_h ] )
    .trimByPlane( [-sin(printing_angle),0,-cos(printing_angle)],0 )
    .translate( [ i1,0,c_h ] )
  )
  .trimByPlane( [0,0,1],hi0_sg ).trimByPlane( [ 1,0,0 ],0 )
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
 const cap_cutout_depth = r3*cos(printing_angle)
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
 const r5_sg = r5 - sg 
 const r3_sg = r3 + sg
 const hi0_sg = hi0 + sg
 const ho0_sg = ho0 + sg

 return cylinder( ho4-ho0_sg,r5_sg ).translate( [ 0,0,ho0_sg ] )
  .add(
   cylinder( ho0_sg-hi0_sg+eps,r4 ).translate( [ 0,0,hi0_sg ] )
  )
  .subtract( cylinder( ho2,r3_sg ) )
  .subtract( cap_retainer( ) )
  .subtract(
   new CrossSection( [
    [ -r5_sg-eps,0 ],[ 0,0 ],
    [ 0,ho0_sg ],[ r5_sg+eps,ho0_sg ],
    [ r5_sg+eps,ho4+eps ],[-r5_sg-eps,ho4+eps ] ] )
    .extrude( i1*2 ).translate( [ 0,0,-i1 ] )
    .rotate( [ 90,0,-90 ] )
    .subtract(
     cube( [ r5/3,r5/3,ho4+2*eps ],true ).translate( [ 0,0,-eps ] ).rotate( [ 0,0,45 ] )
     .intersect( 
      cube( [ 2*edge_margin,r5+eps,ho4 ],true )
     )
       .translate( [ i1,r5/2,ho3+ho4/2 ] )
    )
  )
  .subtract( hinge( ) )
  .trimByPlane( [ 1,0,0 ],button_actor_width( ) )
}

function cap_top( ) {
 return cap_total( )
  .subtract( cap_cutout( ) )
}

function cap_bottom( ) {
 return cap_total( )
  .intersect( cap_cutout( ) )
}

function hinge( ) {
 const i5_sg = i5 + sg
 return sector( 90+alpha,i5_sg ).extrude( 2*(i1+i6) ).translate( [ -r4,-ho3,-i6-i1 ] ).rotate( [ -90,0,90 ] )
}

function slider_base( r1_sg,i3_sg ) {
 const bottom_margin_y = eps
 const bottom_margin_x = bottom_margin_y/tan(printing_angle)
 const height = i0 + eps
 const top_increment = bottom_margin_x+height/tan(printing_angle)
 const bottom_size = r1_sg
 const top_factor = (bottom_size+top_increment)/bottom_size
 const bottom_offset = bottom_size+i3_sg+bottom_margin_x

 const corners_neg = square( bottom_size ).extrude( bottom_margin_y+height,0,0,[ top_factor,top_factor ] )
  .translate( [ -bottom_offset,-bottom_offset,0 ] )
  
 const radial_neg = cylinder( ho4+2*eps,r1_sg+eps )
  .subtract( cylinder( bottom_margin_y+height,r1_sg+bottom_margin_x,r1_sg-top_increment ) )
  
 const section_mask = cube( [ 2*i3_sg,2*(r1_sg+eps),2*(ho4+eps) ],true )
 
 return cylinder( ho4,r1_sg )
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
 return slider_base( r1,i3 )
 .trimByPlane( [ 0,0,-1 ],-hi1 )
 .subtract( cylinder( hi3,r0 ).translate( [ 0,0,hi2 ] ) )
 .subtract( cylinder( hi3,rs ).translate( [0,0,-eps ] ) )
}

function retainer( ) {
 const i2_sg = i2 + sg, hi1_sg = hi1 + sg
 
 const border = hi1_sg+edge_margin+tan(printing_angle)*(r2-i2_sg)
  
 const theta = asin( button_actor_width( )/r3 )
 const theta_min = Math.min( theta,45/2 )

 const base = new CrossSection( [ 
  [r2,0],[r3+(hi0-2*edge_margin)/tan(printing_angle),0],
  [r3+(hi0-2*edge_margin)/tan(printing_angle),edge_margin],
  [r3,hi0-edge_margin],
  [r3,border],[r2,border],
  [i2_sg,hi1_sg+edge_margin],
  [i2_sg,hi1_sg],[r2,hi1_sg],
 ] )
  .revolve( )
  .intersect( sector( 90-2*theta_min,r5+eps ).rotate( theta_min ).extrude( ho1*2 ) )
  
 const mask = sector( 45/2,r5+eps ).extrude( hi1_sg+eps ).translate( [ 0,0,-eps ] )
  .add( sector( 45/2,r2 ).extrude( ho4 ) )
  
 return base
  .subtract( mask ).subtract( mask.mirror( [ -1,1,0 ] ) )
}

function base_disk( ) {
 const rs_sg = rs - sg

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
  .subtract( slider_base( r1,i3 ) )
  .add( cylinder( hs+( hi2-(hi0-i0) )+eps,rs_sg ).translate( [ 0,0,hi0-i0-eps ] ) )
}

function button_actor_width( ) {
 return i1 - wall_strength( ) 
}

function button_shield( ) {
 const r5_sg = r5 - sg
 
 const shield_base = 2*edge_margin
 const shield_tip = edge_margin 
 const shield_slope = (shield_base-shield_tip)/(ho3-hb-ho1)
  
 return cylinder( ho3-eps-ho1,r5_sg ).translate( [ 0,0,ho1 ] )
  .subtract( cylinder(
   ho4,
   r5_sg-shield_tip+shield_slope*ho1,
   r5_sg-shield_base-shield_slope*(ho4-ho3+hb)
  ) )
  .trimByPlane( [ 0,1,0 ] )
}

function button( ) {
 const r5_sg = r5 - sg
 const i1_sg = i1 - sg
 const i5_sg = i5 - sg, i6_sg = i6 - sg
 const hi0_sg = hi0 + sg

 const rounding = circle( r5_sg ).translate( [ -r4,0 ] ).revolve( ).rotate( [ 0,90,0 ] )
  .translate( [ 0,-r4,ho3 ] )
  .add( cylinder( 2*(i1_sg+eps),edge_margin ).rotate( [ 0,90,0 ] )
   .translate( [ -i1_sg-eps,-r4,ho3-i5_sg ] ) )
  .add(
   cylinder( 2*(i1_sg+eps),i5_sg+edge_margin ).rotate( [ 0,90,0 ] )
    .trimByPlane( [ 0,1,0 ],0 )
    .translate( [ -i1_sg-eps,-r4,ho3 ] )
  )
  .hull( )
  
 const head_widen = 0.4*i1
 const head_offset = 10
 
 const top = rounding.add (
  cube( [ 2*(i1_sg+eps),r6+r4+head_offset,hb+eps ] ).translate( [ -i1_sg-eps,-r4,ho3-hb ] )
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
  .intersect( sector( 2*theta_min,r5_sg ).rotate( -theta_min-90 ).extrude( ho4 ) )
  
 const bottom = cylinder( ho3,r4 ).subtract( cylinder( ho3+eps,r3 ) )
  .add( ret )
  .intersect( cube( [ 2*button_actor_width( ),r5_sg,ho4 ] ).translate( [ -button_actor_width( ),-r5_sg,0 ] ) )
  .intersect(
   cylinder( 2*(i1+eps),ho3-hi0_sg ).rotate( [ 0,90,0 ] )
    .translate( [ -i1-eps,-r4,ho3 ] )
  )
  
 const hinge = sector( 180,i5_sg ).extrude( 2*(i1_sg+i6_sg) ).rotate( [0,90,0] )
  .translate( [ -i1_sg-i6_sg,-r4,ho3 ] ) 
  
 const springguide = cylinder( hs+eps,rs ).translate( [ 0,0,ho3-edge_margin-hs ] ) 
  
 return bottom
  .add( top )
  .add( button_shield( ) )
  .trimByPlane( [ -1,0,0],-i1_sg )
  .trimByPlane( [ 1,0,0],-i1_sg )
  .add(
   circle( i1 ).translate( [ 0,r8 ] ).add(
    circle( i1 ).translate( [ head_widen,0 ] )
     .add(
      circle( i1 ).translate( [ -head_widen,0 ] )
     ).translate( [ 0,(r8+r6+head_offset)/2 ] )
   )
   .add(
    circle( i1 ).translate( [ 0,r6+head_offset ] )
   ).hull( ).extrude( hb+eps ).translate( [ 0,0,ho3-hb ] )
  )
  .add( hinge )
  .trimByPlane( [ 0,0,-1],-ho3 )
  .add( springguide )
}

function spring( ) {
 const incline = 4
 const thickness = 0.2
 const radius = rs+2*thickness
 const height = ho3-hb-hi0-2*thickness
 
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

function rectangle_sector( a,r,w ) {
 const abscissa = w/sin(a)
 
 return new CrossSection( [
  [ abscissa,0 ],
  [ abscissa+(r+eps)/tan(a),r+eps ],
  [ -w,r+eps ],
  [ -w,0 ]
 ] )
}

function wall_strength( ) {
 return r6 - r5
}

function chassis( ) {
 const
  separation = r6+rr2+wall_strength()*2,
  boundary = r7+hs1+wall_strength( )

 const retainer_circle = circle( rr2+wall_strength( ) ).translate( retainer_center( ) )

 return circle( r6 ).add( retainer_circle ).hull( )
  .add( 
   retainer_circle
   .add( sector( 45,r6 ).subtract( rectangle_sector( 45,r6,i1 ) ) )
   .add( circle( rf ).translate( [ boundary-rf,i1] ) )
   .add( circle( rf ).translate( [ boundary-rf,-i1 ] ) )
   .hull( )
  )
}

function retainer_separation( ) {
 return r6+rr2+wall_strength()*2
}

function retainer_center( ) {
 return [ retainer_separation( )*cos(gamma),-retainer_separation( )*sin(gamma) ]
}

function left_edge_angle( ) {
 return -gamma + asin( (r6 - (rr2+wall_strength( )))/retainer_separation( ) )
}

function right_edge_angle( ) {
 const boundary = r7+hs1+wall_strength( )
 
 const
  delta_x = ( boundary-rf-retainer_center( )[ 0 ] ),
  delta_y = ( -i1-retainer_center( )[ 1 ] )
 const separation = Math.sqrt( delta_x**2 + delta_y**2 )
 
 return atan( delta_y/delta_x ) + asin( ( rr2+wall_strength( ) - rf )/separation )
}

function chassis_total( ) {
 const r4_sg = r4 + sg

 const disasm_action_incision_neg = rectangle_sector( 45,r6,button_actor_width( ) )
  .extrude( ho4+2*eps ).translate( [ 0,0,-eps ] )
  .rotate( [ 0,0,180 ] )
  
 const z = ho4-ho1
 const zeta = z/r6*180/PI 
  
 const taper = sector( asin( i1/r6 ),r6+eps )
  .subtract( circle( r5-eps ) ).extrude( z,1,zeta )
  .translate( [ 0,0,(ho1+ho2)/2 ] )
  .rotate( [ 0,0,90 ] )
  
 const push_incision_neg = cube( [ r6+eps,2*i1,ho4+2*eps ] ).translate( [ -r6-eps,-i1,-eps ] )
  .add( taper )
  .add( taper.mirror( [ 1,0,0 ] ).rotate( [ 0,0,90 ] ) )
   
 const disasm_incision_neg = rectangle_sector( 45,r6,i1 )
  .extrude( ho4+2*eps ).translate( [ 0,0,-eps ] )
  
 const inlet = cylinder( wall_strength( )+2*eps,rc2 )
  .translate( [ 0,0,-eps ] ) 
  .rotate( [ 90,0,0 ] )
  .translate( [ inlet_dist,-rr2+eps,hc ] )
  .rotate( [ 0,0,right_edge_angle( ) ] )
  .translate( retainer_center( ).concat( [ 0 ] ) )
  
 const speakers = cylinder( wall_strength( )+2*eps,rc1 )
  .translate( [ 0,0,-eps ] )
  .rotate( [ 90,0,0 ] )
  .translate( [ speakers_dist,-rr2+eps,hc ] )
  .rotate( [ 0,0,right_edge_angle( ) ] )
  .translate( retainer_center( ).concat( [ 0 ] ) )
  
 const mic = cylinder( wall_strength( )+2*eps,rc0 )
  .translate( [ 0,0,-eps ] )
  .rotate( [ 90,0,0 ] )
  .translate( [ -mic_dist,-rr2+eps,hc ] )
  .rotate( [ 0,0,left_edge_angle( ) ] )
  .translate( retainer_center( ).concat( [ 0 ] ) )

 return chassis( ).extrude( ho4 )
  .subtract( cylinder( ho4+eps,r4_sg ) )
  .subtract(
   cylinder( ho4+eps,r5 ).intersect(
    cylinder( ho4-ho0+eps,r5+eps ).translate( [ 0,0,ho0 ] )
     .add( disasm_incision_neg )
     .add( push_incision_neg )
     .add( disasm_action_incision_neg )
   )
   )
  .subtract(
   push_incision_neg.add( disasm_incision_neg ).trimByPlane( [ 0,0,1 ],ho1 )
  )
  .subtract(
   sector( 90,r6+eps ).rotate( 90 ).extrude( ho4-ho2+eps ).translate( [ 0,0,ho3-hb ] )
  )
  .subtract( inlet )
  .subtract( speakers )
  .subtract( mic )
  .trimByPlane( [ 0,0,1 ],hi0 )
}

function pushswitch( ) {
 return cylinder( 3.5+eps,1.225 )
  .add( cylinder( 3+eps,2 ).translate( [ 0,0,3.5 ] ) )
  .add( cylinder( 8,3.25 ).translate( [ 0,0,6.5 ] ) )
  .add( cube( [ 2.54,2,3+eps ],true ).translate( [ 0,0,14.5+1.5-eps ] ) )
  .translate( [ 0,0,-(3.5+3-hs3) ] )
  .rotate( [ 0,90,0 ] )
  .translate( [ 0,0,-sin(phi)*hs3-rs1 ] )
  .rotate( [ 0,-phi,0 ] )
  .translate( [ r7,0,cos(phi)*rs1+hs2+sin(phi)*hs3 ] )
}

function cable_slot( ) {
 return cube( [ 2*rc0+eps,button_actor_width( ),ho4 ] )
  .translate( [ r5+hs1-2*rc0,-button_actor_width( )-wall_strength( )-eps,ho2-2*rc0 ] )
}

function cable_complement_mask( ) {
 return cube( [ ( speakers_dist-inlet_dist )+rc1+rc2+2*edge_margin,wall_strength( )+2*eps,ho4 ] )
  .translate( [ inlet_dist-rc2-edge_margin,-rr2-wall_strength()-eps,hc ] )
  .rotate( [ 0,0,right_edge_angle( ) ] )
  .translate( retainer_center( ).concat( [0] ) ) 
  .add(
   cube( [ 2*(rc0+edge_margin),wall_strength( )+2*eps,ho4 ] )
    .translate( [ -mic_dist-rc0-edge_margin,-rr2-wall_strength( )-eps,hc ] )
    .rotate( [ 0,0,left_edge_angle( ) ] )
    .translate( retainer_center( ).concat( [0] ) )
  )
}

function top_cover_cs( ) {
 const chi = 30
 const radius = (r6-cos(chi)*r5)/sin(chi)
 const R = Math.sqrt( radius**2 + r5**2 )
 const theta = - 90 - ( atan( radius/r5 ) - chi ) + left_edge_angle( )  
 const curve_center = [ cos(theta)*R,sin(theta)*R ]
 
 const curve = circle( radius ).translate( curve_center )
 const bb = chassis( ).bounds( )
 
 return top_neg_cs = new CrossSection( [
  curve_center,
  [ curve_center[ 0 ],bb.min[1]-eps ],[ bb.max[0]+eps,bb.min[1]-eps ],
  [ bb.max[0]+eps,bb.max[1]+eps ],[ 0,bb.max[1]+eps ]
 ] )
  .subtract( curve )
}
 
 
function top_cover_mask( ) {
  return top_cover_cs( ).subtract(
  square( [ 4*wall_strength( ),wall_strength( ) ] ).translate( [ r5+hs1/2-2*wall_strength( ),button_actor_width( )+wall_strength( ) ] )
  )
  .extrude( ho4 )
  .translate( [ 0,0,ho2 ] )
}

function cable_cavity( ) {
 const action_incision_neg = cube( [ r5+hs1,2*button_actor_width( ),ho4+2*eps ] ).translate( [ 0,-button_actor_width( ),-eps ] )

 return cavity = top_neg_cs.intersect( chassis( ) )
  .subtract( circle( r5 ) )
  .subtract( circle( rr2 ).translate( retainer_center( ) ) )
  .offset( -wall_strength( ) )
  .extrude( ho4+2*eps ).trimByPlane( [ 0,-1,0] )
  .translate( [ 0,0,-eps ] )
  .subtract(
   cube( [ 2*hs1,wall_strength( ),ho4+2*eps ] )
    .translate( [ r5,-button_actor_width( )-wall_strength( ),-eps ] )
    .subtract( cable_slot( ) )
  )
  .add(
   action_incision_neg
  )
}

function wall( ) {
  return chassis_total( )
   .subtract( top_cover_mask( ) )
   .subtract( cable_cavity( ) )
   .subtract( cable_complement_mask( ) )
   .subtract( cylinder( ho4,rr2 ).translate( retainer_center( ).concat( [0] ) ) )
}

function rotated_button( angle ) {
 return button( )
  .translate( [ 0,r4,-ho3 ] )
  .rotate( [ -angle,0,0 ] )
  .translate( [ 0,-r4,ho3 ] )
}

function main_retainer_neg( ) {
 const h = ho4/2+2*eps
 const free = sector( 90,rr1+eps ).extrude( h )
 return cylinder( h,(rr1+rr0-h/tan(printing_angle))/2,(rr1+rr0+h/tan(printing_angle))/2 )
  .add( cylinder( h,rr0 ) )
  .add( free ).add( free.rotate( [ 0,0,180 ] ) )
  .intersect( cylinder( h,rr1 ) )
  .translate( [0,0,-eps] )
}

function top_cover( ) {
 const ret_y = sin(phi)*hs3+hs2+cos(phi)*rs1
 const switchbutton_ret = new CrossSection( [
  [ 0,ret_y ],[ edge_margin,ret_y ],
  [ edge_margin+tan(printing_angle)*ho4,ret_y + ho4 ],[ 0,ret_y + ho4 ]
 ] )
  .extrude( button_actor_width( )*2 )
  .rotate( [ 90,0,0 ] )
  .translate( [ r7,button_actor_width( ),0 ] )
  .trimByPlane( [ 0,0,-1 ],-ho4+eps )
  
  
 return chassis_total( ).intersect(
  top_cover_mask( )
  .add( cable_complement_mask( ).subtract( cable_cavity( ) ) )
 )
  .add( switchbutton_ret )
  .add(
   cylinder( ho2-ho4/2+eps,rr2 )
    .translate( retainer_center( ).concat( [ho4/2] ) )
  )
  .subtract( main_retainer_neg( ).translate( retainer_center( ).concat( [ ho4/2 ] ) ) )
}

function main_retainer( ) {
 const ceil = ho4-4
 const dia = 2
 
 const h = ho4/2+2*eps
 const slope = cylinder( h,(rr1+rr0-h/tan(printing_angle))/2,(rr1+rr0+h/tan(printing_angle))/2 ).translate( [ 0,0,-eps ] )
 const free = sector( 90,rr1+eps ).extrude( ho4/2+eps ).translate( [ 0,0,0 ] )
 return slope.add(
  slope.intersect( free.add( free.rotate( [ 0,0,180 ] ) ) ).mirror( [ 0,0,1 ] )
 )
  .add( cylinder( ho4,rr0 ).translate( [ 0,0,-ho4/2 ] ) )
  .add( free ).add( free.rotate( [ 0,0,180 ] ) )
  .intersect( cylinder( ho4,rr1 ).translate( [ 0,0,-ho4/2 ] ) )
  .subtract( cylinder( ho4-ceil+eps,rr0-edge_margin ).translate( [ 0,0,-eps-ho4/2 ] ) )
  .subtract( cylinder( ho4+2*eps,dia ).translate( [ 0,0,-eps-ho4/2 ] ) )
  .translate( retainer_center( ).concat( [ ho4/2 ] ) )
}

function switchbutton_holder( ) {
 const ret_y = sin(phi)*hs3+hs2+cos(phi)*rs1
 const ext = new CrossSection( [
  [ edge_margin,ret_y ],[ 0,ret_y ],
  [ tan(phi)*(ret_y-hi0),hi0 ],[ hs1,hi0 ],
  [ hs1,ret_y+ho4 ],[ edge_margin+tan(printing_angle)*ho4,ret_y+ho4 ]
 ] ).extrude( 2*button_actor_width( ) )
  .rotate( [ 90,0,0 ] )
  .trimByPlane( [ 0,0,-1 ],-ho2 )
  .translate( [ r7,button_actor_width( ),0 ] )

 const neg = cube( [ hs1,rs1*2,ho4 ] )
  .translate( [ 0,0,-ho4/2 ] )
  .rotate( [ 0,-phi,0 ] )
  .translate( [ r7+cos( phi )*hs3,-rs1,ret_y ] )
  
 return ext.subtract( neg )
  .subtract(
   cylinder( hs1,rs0 )
    .rotate( [ 0,90,0 ] )
    .translate( [ -eps,0,-sin(phi)*hs3-rs1 ] )
    .rotate( [ 0,-phi,0 ] )
    .translate( [ r7,0,ret_y ] )
  )
  .subtract( cable_slot( ) )
}

function bottom_cover( ) {
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

 const base_neg = 
   cylinder( hi0+2*eps,r3 ).translate( [ 0,0,-eps ] )
   .add( retainer ).add( retainer.rotate( [ 0,0,180 ] ) )
   
 const shield_slice = button_shield( )
  .translate( [ 0,r4,-ho3 ] )
  .rotate( [ -alpha,0,0 ] )
  .translate( [ 0,-r4,ho3 ] )
  .rotate( [ 0,-90,-90 ] )
  .slice( 0 )
 
 const shield_neg_cs = shield_slice.add(
  square( [ eps,hi0 ] )
   .translate( [ r5-eps,shield_slice.bounds( ).min[ 1 ] ] )
 ).hull( )
 
 const mask_cube = cube( [ r6,i1*2,hi0+eps ] ).translate( [ -r6,-i1,0 ] )
 const shield_neg_alpha = shield_neg_cs.revolve( ).intersect(
  mask_cube
 )
 
 const shield_neg_beta = shield_neg_cs.revolve( ).intersect(
  mask_cube.rotate( [ 0,0,-90 ] ).add( mask_cube.rotate( [ 0,0,-135 ] ) ).hull( )
 )
  
 return chassis( ).extrude( hi0 )
  .add(
   cylinder( ho4/2-eps,rr2 )
    .translate( retainer_center( ).concat( [eps] ) )
  )
  .subtract(
   main_retainer_neg( )
    .rotate( [ 0,0,90 ] )
    .mirror( [ 0,0,1 ] )
    .translate( retainer_center( ).concat( [ ho4/2 ] ) )
  )
  .subtract( base_neg )
  .subtract( shield_neg_alpha )
  .subtract( shield_neg_beta )
}

const stators = [
 pushswitch( )
 ,wall( )
 ,main_retainer( )
 ,bottom_cover( )
 ,top_cover( )
 ,switchbutton_holder( )
 ,base_disk( )
 ,retainer()
 ,retainer().rotate( [ 0,0,180 ] )
]

const rotors = [
 spring( )
 ,rotated_button( 0 )
 ,slider( )
 ,turntable( )
 ,cap_bottom( )
 ,cap_top( )
 ,turntable( ).mirror( [ 1,0,0 ] )
 ,cap_bottom( ).mirror( [ 1,0,0 ] )
 ,cap_top( ).mirror( [ 1,0,0 ] )
]


export default ( rotors.map( (o) => o.rotate( [ 0,0,90 ] ) ).concat( stators ).map( (o) => c(o) ) )

