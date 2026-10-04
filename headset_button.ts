// ManifoldCAD (https://manifoldcad.org/)

// TODO:
// Vertical pin on turntable
// Increase slider wall on inside
// Extend bottom lever beyond joint Y
// Subtract rail from switch-holder
// Add pin to wall to stabilize switch-holder

// Generic parameters
const printing_angle = 50
const edge_margin = 1
const sg = 0.1 // Slip-Gap
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

const
ib = 1 // Base inset

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
ho0 = 9, // Retention edge and pswitch upper margin
ho2 = 16, // Cap bottom
ho3 = 20, // Swivel (Lever Axis Y)
ho4 = 21 // Button top

// Spring retainer
const
rs = 6,
hs = 1,
is = 2.5
const pin = {
 radius: 1,
 height: 4,
 distance: 3,
 spacing: 4
}

const mediator = {
 width: 3,
 margin: 0.5,
 buffer: 3,
 altitude: 2,
 height: 4
}
 
// Haptic lever
const levers = {
 radius: 1.5,
 margin: edge_margin,
 top: {
  height: 7.1,
  width: 3,
  radius: 1.5,
  leg: 2.1,
  pin: {
   position: {
    angle: 42,
    separation: 0
   },
   radius: 1,
   margin: edge_margin
  }
 },
 bottom: {
  height: 7,
  width: 3,
  radius: 1.5,
  reenforce: 4,
  leg: 2
 }
}

const levers_indent = {
 top: levers.top.radius,
 bottom: (-edge_margin)
}

// Button thickness
const hb = 3

const switchframe = {
 length: 12,
 space: 3.25+edge_margin/2,
 radius: 2,
 x: r5+5,
 y: 3.25+1,
 incline: 10,
 wall: 1.5
}

// Pushswitch parameters (anchor at wall meet center)
const
hs1 = 12, // Maximal height
rs0 = 2, // Meet radius
rs1 = 3.25, // Maximal radius
hs3 = 1.5, // Retainer wall
r7 = r5+5, // Wall front (X)
hs2 = hi0+rs1+1, // Altitude (Y)
phi = 10 // Incline

// Cable parameters
const
rc0 = 1.5, // Mic cable radius
rc1 = 1.5, // Speaker cable radius
rc2 = 3 // Inlet cable radius

// Chassis geometry
const
rf = 4, // Fillet radius
rr2 = 12, // Main retainer cutout
rr1 = 10, // Inner retainer cutout
rr0 = 8 // Retainer radius

const
hc = (ho2+hi0)/2 // Cable holes altitude

// Cable hole positions
const
 inlet_dist = 1.8*rr2,
 speakers_dist = 2.8*rr2,
 mic_dist = 1.2*rr2

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

function acos( ratio ) {
 return Math.acos( ratio )*180/PI
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
 return cube( [2*(i1+eps),2*r6,2*(ho4+eps)] )
  .translate( [-i1-eps,-r6+r4,-2*ho4+eps ])
  .trimByPlane( [0,sin(alpha),cos(alpha)],-hb)
  .translate( [0,-r4,ho3])
}


function radial_separation( v ) {
 const x = v[ 0 ], y = v[ 1 ]
 const l = Math.sqrt( x*x + y*y )
 return [ x - y/l*edge_margin, y + x/l*edge_margin ]
}

function turntable_cutout( ) {
 const capretainer = i4+( (ho4-ho2)-2*edge_margin)/tan(printing_angle)
 const sliderret = r0 + edge_margin
 const ylimit = capretainer > sliderret ? capretainer : sliderret
 
 const section = cube( [ r5,r5,ho4 ] ).rotate( [ 0,0,180+acos(ylimit/i2) ] )
  .trimByPlane( [ 0,-1,0 ],ylimit )
  
 const half = section
  .trimByPlane( [ 0,0,1 ],hi1 + pin.height )
  .add(
   cylinder( ho4,r5+eps )
   .subtract( cylinder( ho4+2*eps,i2 ).translate( [ 0,0,-eps ] ) )
   .intersect( section )
  )
  .add( cube( [ i1+eps,ylimit+eps,ho4 ] ).translate( [ -eps,-ylimit-eps,hi1+pin.height ] ) )
  .trimByPlane( [ 1,0,0 ],-eps )
  .add( cube( [ pin.spacing,r5,pin.height+eps ] ).translate( [ 0,-r5,hi1 ] ) )
  
 return half.add( half.mirror( [ 1,0,0 ] ) )

}

function turntable_base( ) {
 const r3_sg = r3 + sg, hi0_sg = hi0 + sg, r2_sg = r2 - sg
 
 return new CrossSection( [
  [-eps,hi0_sg-eps],[i2,hi0_sg-eps],
  [i2,hi1+edge_margin],
  [i2+(ho2-hi1-edge_margin)/tan(printing_angle),ho2],
  [-eps,ho2]
 ] ).revolve( )
 .intersect( cylinder( ho4,r3_sg ) )
 .add( cap_retainer( ).add( cap_retainer( ).mirror( [ 1,0,0 ] ) ).trimByPlane( [ 0,0,-1 ],-ho4 ) )
}

function turntable_pin( ) {
 return turntable_base( ).intersect( turntable_cutout( ) )
  .trimByPlane( [ 0,0,1 ],hi1+pin.height )
  .trimByPlane( [ 0,-1,0 ],r0 )
  .trimByPlane( [ 0,0,-1 ],-ho2 )
  .subtract(
   button_space( ).intersect( cube( [ 2*i1,2*r5,2*ho4 ],true ) )
   .add( button_space( ).intersect( cube( [ 2*(i1+eps),2*r0,2*ho4 ],true ) ) )
  )
  .subtract(
   cylinder( ho4,pin.radius )
   .translate( [ 0,-r0-pin.radius-pin.distance,0 ] )
  )
}

function turntable( ) {
 const r3_sg = r3 + sg, hi0_sg = hi0 + sg, r2_sg = r2 - sg
 
 const ret_b = sector( 135,r2_sg ).rotate( -135/2.0 )
  .extrude( hi1-hi0_sg+eps ).translate( [0,0,hi0_sg-eps ])
  .subtract( cylinder( ho4,r1+eps ) ) 
 
 const c_h = ho2-edge_margin
 
 const slider_neg_half = slider_base( r1+sg,i3+sg )
  .translate( [ -i1,0,-c_h ] )
  .trimByPlane( [-sin(printing_angle),0,-cos(printing_angle)],0 )
  .translate( [ i1,0,c_h ] )
  .trimByPlane( [ 1,0,0 ],-eps )
 
 return turntable_base( )
  .subtract( turntable_cutout( ) )
  .subtract(
   cube( [ i1*2,r5+eps,ho4 ] ).translate( [ -i1,0,0] )
    .intersect( cylinder( ho4,r1 ) )
  )
  .add( ret_b )
  .add( ret_b.mirror( [ 1,0,0 ] ) )
  .subtract( slider_neg_half.add( slider_neg_half.mirror( [ 1,0,0 ] ) ) )
  .add(
   cylinder( pin.height+eps+edge_margin,pin.radius )
   .translate( [ 0,-r0-pin.radius-pin.distance,hi1-eps ] )
  )
  .trimByPlane( [0,0,1],hi0_sg )
  .subtract(
   button_space( ).intersect( cube( [ 2*i1,2*r6,2*ho4 ],true ) )
  )
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

function cost( a,b,c ) {
 return acos( ((a+b)**2 - c**2)/(2*a*b) - 1 )
}

const lever_bottom_anchor = (hi0-i0-ib-levers_indent.bottom+levers.bottom.radius)
const lever_top_anchor = (ho3-hb+levers_indent.top-levers.top.radius)
const lever_dist = lever_top_anchor-lever_bottom_anchor

function lever_press( slant,bump ) {
 const y = ho3-lever_top_anchor
 const Dx = r4 - (r4*cos(slant) - y*sin(slant))
 const Dy = ho3 - (r4*sin(slant) + y*cos(slant)) - lever_bottom_anchor - bump
 const r = Math.sqrt( Dx**2 + Dy**2 )
 return {
  radius: r,
  angle: asin( Dx/r )
 }
}
 
function bottom_lever( slant=0,bump=0 ) {
 const i1_sg = i1-sg
 const r_sg = levers.radius - sg
 
 const base_angle = cost( levers.bottom.height,lever_dist,levers.top.height )
 const leg_joint = circle( levers.bottom.radius ).translate( [ 0,levers.bottom.leg ] )
 
 const bend = cost( levers.bottom.height,lever_press( slant,bump ).radius,levers.top.height )- base_angle
 
 return (
  circle( levers.bottom.radius )
  .add( leg_joint )
  .hull( )
  .add(
   circle( r_sg )
   .translate( [ 0,levers.bottom.height ] )
   .rotate( base_angle )
   .add( leg_joint )
   .add( circle( levers.bottom.radius ).translate( [ 0,levers.bottom.reenforce ] ) )
   .hull( )
  )
  .extrude( levers.bottom.width-sg )
  .add(
   cylinder( levers.top.width+eps,r_sg )
   .translate( [ 0,levers.bottom.height,levers.bottom.width-eps ] )
   .rotate( [ 0,0,base_angle ] )
  )
  .add(
   cylinder( levers.top.width+eps,levers.bottom.radius )
   .translate( [ 0,0,levers.bottom.width-eps ] )
  )
 )
 .rotate( [ 90,0,-90 ] )
 .rotate( [ lever_press( slant,bump ).angle-bend,0,0 ] )
 .translate( [ i1_sg,0,lever_bottom_anchor+bump ] )
}

function top_lever( negative: boolean,slant=0,bump=0 ) {
 const i1_sg = i1-sg
 const base_angle = cost( levers.top.height,lever_dist,levers.bottom.height )
 const leg_joint = circle( levers.top.radius ).translate( [ 0,levers.top.leg ] )
 const pin_offset = levers.radius+levers.top.pin.margin+levers.top.pin.position.separation+levers.top.pin.radius
 
 function set_pin(m) {
  const pin = cylinder( 2*(i1_sg-levers.bottom.width-edge_margin),levers.top.pin.radius )
   .translate( [ pin_offset,0,edge_margin ] )
   .rotate( [0,0,levers.top.pin.position.angle] )
   .translate( [ 0,levers.top.height,0 ] )
   .rotate( [0,0,base_angle] )
   
  if( negative ) {
   return m.subtract( pin )
  } else {
   return m.add( pin )
  }
 }
 
 const bend = cost( levers.top.height,lever_press( slant,bump ).radius,levers.bottom.height )- base_angle
 
 return set_pin(
  circle( levers.top.radius )
  .add( leg_joint )
  .hull( )
  .add(
   circle( levers.radius+levers.margin )
   .add( 
    circle( levers.top.pin.radius + levers.top.pin.margin )
    .translate( [ pin_offset,0 ] )
    .rotate( levers.top.pin.position.angle ) 
   )
   .translate( [ 0,levers.top.height ] )
   .rotate( base_angle )
   .add( leg_joint )
   .hull( )
  )
  .subtract(
   circle( levers.radius )
   .translate( [ 0,levers.top.height ] )
   .rotate( base_angle )
  )
  .extrude( levers.top.width )
  .add(
   cylinder( i1_sg-levers.bottom.width-eps,levers.top.radius )
   .translate( [ 0,0,eps ] )
  )
 )
 .rotate( [ -90,0,-90 ] )
 .rotate( [ slant+lever_press( slant,bump ).angle+bend,0,0 ] )
 .translate( [ -i1_sg+levers.bottom.width,0,lever_top_anchor ] )
 .translate( [ 0,r4,-ho3 ] )
 .rotate( [ -slant,0,0 ] )
 .translate( [ 0,-r4,ho3 ] )
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
 const line_chamfer_neg = square( [ i3_sg,ho4 ] )
  .translate( [ 0,-ho4/2 ] )
  .rotate( 90-printing_angle )
  .translate( [ i3_sg,0 ] )
  
 const curve_chamfer_neg = square( [ i3_sg,ho4 ] )
  .translate( [ 0,-ho4/2 ] )
  .rotate( 90-printing_angle )
  .translate( [ r1_sg,0 ] ) 
  
 const curve_mask = cylinder( ho4+2*eps,r1_sg ).translate( [ 0,0,i0-ho4-eps ] )  
 
 return square( [ 2*i3_sg,ho4 ] )
  .translate( [ -i3_sg,i0-ho4 ] )
  .subtract( line_chamfer_neg  )
  .subtract( line_chamfer_neg.mirror( [ 1,0 ] ) )
  .extrude( 2*(r1_sg + eps) ).translate( [ 0,0,-r1_sg-eps ] ).rotate( [ 90,0,90 ] )
  .intersect( curve_mask )
  .subtract( curve_chamfer_neg.revolve( ) )
  .mirror( [ 0,0,1 ] )
  .translate( [ 0,0,hi0-ib ] )
}

function slider( ) {
 const base_angle = cost( levers.bottom.height,lever_dist,levers.top.height )
 const bend = cost( levers.bottom.height,lever_press( alpha,i0 ).radius,levers.top.height )- base_angle
 
 const side_neg =
  circle( levers.bottom.radius+sg )
  .add(
   circle( levers.bottom.radius+sg ).translate( [ 0,ho4 ] )
   .rotate( -lever_press( alpha,i0 ).angle+bend )
  )
  .add( circle( levers.bottom.radius+sg ).translate( [ 0,ho4 ] ) )
  .hull( )
  .extrude( levers.bottom.width+2*sg )
  .rotate( [ 90,0,-90 ] )
  .translate( [ i1,0,0 ] )
  .add(
   cylinder( levers.top.width+sg+eps,levers.bottom.radius+sg )
   .rotate( [ 0,90,0 ] )
   .translate( [ i1-levers.bottom.width-levers.top.width-2*sg,0,0 ] )
  )
  .translate( [ 0,0,lever_bottom_anchor ] )
  
 return slider_base( r1,i3 )
 .subtract(
  square( ho4 ).translate( [ -ho4-r0,hi0-ib ] )
  .add( square( ho4 ).translate( [ -ho4-levers.bottom.radius-edge_margin,lever_bottom_anchor ] ) )
  .hull( )
  .add( square( ho4 ).translate( [ -ho4,lever_bottom_anchor ] ) )
  .extrude( 2*i1 )
  .rotate( [ 90,0,-90 ] )
  .translate( [ i1,0,0 ] )
  .add(
   cube( [ 2*(i1-levers.bottom.width),r1,ho4 ],true )
   .translate( [ 0,0,ho4/2+lever_bottom_anchor ] )
  )
 )
 .subtract( side_neg ).subtract( side_neg.mirror( [ 1,0,0 ] ) )
 .trimByPlane( [ 0,0,-1 ],-ho0 )
}

function retainer( stopper: boolean = false ) {
 const i2_sg = i2 + sg, hi1_sg = hi1 + sg
 
 const border = hi1_sg+edge_margin+tan(printing_angle)*(r2-i2_sg)
  
 const delta_theta = stopper ? Math.max( 45/2-asin( button_actor_width( )/r3 ),0 ) : 0
 
 const base = new CrossSection( [ 
  [r2,0],[r3+(hi0-2*edge_margin)/tan(printing_angle),0],
  [r3+(hi0-2*edge_margin)/tan(printing_angle),edge_margin],
  [r3,hi0-edge_margin],
  [r3,border],[r2,border],
  [i2_sg,hi1_sg+edge_margin],
  [i2_sg,hi1_sg],[r2,hi1_sg],
 ] )
  .revolve( )
  .intersect(
   sector( 45+delta_theta,r5+eps )
   .rotate( 45/2 )
   .extrude( ho1*2 )
  )
  
 const mask = sector( 45/2,r2 ).extrude( ho4 )
  
 return base
  .subtract( mask ).subtract( mask.mirror( [ -1,1,0 ] ) )
}

function base_disk( ) {
 const { sect_mask,ret_above,ret_below,ret_none,ret_full }= base_lock_mask( )
 const delta_theta = Math.max( 45/2-asin( button_actor_width( )/r3 ),0 )
 
 const notch_neg = sector( 45,r3+eps ).subtract( circle( i2 ) ).rotate( 45/2 ).extrude( ho1 ).translate( [ 0,0,hi0-(2*hi0-hi1) ] )
  
 const mask = cylinder(hi0+2*eps,r2).translate( [0,0,-eps] ).add(
  ret_above.intersect(
   sect_mask( 45/2-delta_theta+90-45/2+eps,180+45+45/2+delta_theta )
   .add( sect_mask( 45/2-delta_theta+90-45/2+eps,45+45/2 ) )
  )
 )
 .add(
  ret_none.intersect(
   sect_mask( 45+delta_theta,-45/2-delta_theta )
   .add( sect_mask( 45+delta_theta,180-45/2-delta_theta ) )
  )
 )
 
 return cylinder( hi1-hi0+eps,r3 ).translate( [ 0,0,hi0-eps ] )
  .subtract(
   cylinder( ho4,r2 )
   .add( sect_mask( 45,45/2) )
   .add( sect_mask( 45+delta_theta,180+45/2 ) )
  )
  .add( mask.trimByPlane( [ 0,0,-1 ],-hi0 ) )
  .subtract( notch_neg ).subtract( notch_neg.rotate( [ 0,0,180 ] ) )
  .trimByPlane( [ 0,0,1 ],0 )
  .subtract( cylinder( ho4,r1+sg ).translate( [ 0,0,hi0-ib ] ) )
  .subtract( slider_base( r1+sg,i3+sg ) )
  .subtract( slider_base( r1+sg,i3+sg ).rotate( [ 0,0,90 ] ) )
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

function button( slant=0 ) {
 const r1_sg = r1 - edge_margin,
  r5_sg = r5 - sg,
  i1_sg = i1 - sg,
  i5_sg = i5 - sg, i6_sg = i6 - sg,
  hi0_sg = hi0 + sg

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
 const theta = asin( (button_actor_width( )-sg)/r3 )
 const theta_min = Math.min( theta,45/2 )
 const ret = new CrossSection( [
  [r3+eps,hi1+2*edge_margin+height],
  [r3-protrusion,hi1+2*edge_margin],
  [r3-protrusion,hi1+edge_margin],[r3+eps,hi1-0*eps]
 ] ).revolve( )
  .intersect( sector( 2*theta_min,r5_sg ).rotate( -theta_min-90 ).extrude( ho4 ) )
  
 const bottom = cylinder( ho3,r4 ).subtract( cylinder( ho3+eps,r3 ) )
  .add( ret )
  .intersect( cube( [ 2*(button_actor_width( )-sg),r5_sg,ho4 ] ).translate( [ -(button_actor_width( )-sg),-r5_sg,0 ] ) )
  .intersect(
   cylinder( 2*(i1+eps),ho3-hi0_sg ).rotate( [ 0,90,0 ] )
    .translate( [ -i1-eps,-r4,ho3 ] )
  )
  
 const hinge = sector( 180,i5_sg ).extrude( 2*(i1_sg+i6_sg) ).rotate( [0,90,0] )
  .translate( [ -i1_sg-i6_sg,-r4,ho3 ] ) 
  
 const reenforce = cylinder( levers.bottom.width-sg+eps,levers.top.radius+edge_margin )
   .scale( [ 1,1.5,1 ] )
   .rotate( [ 0,-90,0 ] )
   .translate( [ i1_sg+eps,0,ho3-hb ] )
   
 const base_angle = cost( levers.top.height,lever_dist,levers.bottom.height )
 const bend = cost( levers.top.height,lever_press( alpha,i0 ).radius,levers.bottom.height )- base_angle
 
 const notch = circle( levers.top.radius + sg )
  .add( circle( levers.top.radius + sg ).translate( [ 1.5*edge_margin+3*levers.top.radius,0,0 ] ) )
  .hull( )
  .extrude( levers.top.width+2*sg )
  .rotate( [ 90,90-(alpha+lever_press( alpha,i0 ).angle+bend),90 ] )
  .translate( [ i1_sg-levers.bottom.width-levers.top.width-sg,0,lever_top_anchor ] )
  
 return bottom
  .add( top )
  .add( button_shield( ) )
  .subtract( notch ).subtract( notch.mirror( [ 1,0,0 ] ) )
  .subtract(
   cylinder( 2*(i1_sg-levers.bottom.width+sg),levers.top.radius+sg )
   .rotate( [ 0,90,0 ] )
   .translate( [ -(i1_sg-levers.bottom.width+sg),0,ho3-hb ] )
  )
  .add( reenforce ).add( reenforce.mirror( [ 1,0,0 ] ) )
  .trimByPlane( [ -1,0,0],-i1_sg )
  .trimByPlane( [ 1,0,0],-i1_sg )
  .add(
   circle( i1_sg ).translate( [ 0,r8 ] ).add(
    circle( i1_sg ).translate( [ head_widen,0 ] )
     .add(
      circle( i1_sg ).translate( [ -head_widen,0 ] )
     ).translate( [ 0,(r8+r6+head_offset)/2 ] )
   )
   .add(
    circle( i1_sg ).translate( [ 0,r6+head_offset ] )
   ).hull( ).extrude( hb+eps ).translate( [ 0,0,ho3-hb ] )
  )
  .add( hinge )
  .trimByPlane( [ 0,0,-1],-ho3 )
  .translate( [ 0,r4,-ho3 ] )
  .rotate( [ -slant,0,0 ] )
  .translate( [ 0,-r4,ho3 ] )
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
 return r6+rr2+wall_strength()
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

function pswitch( ) {
 return cylinder( 3.5+eps,1.225 )
  .add( cylinder( 3+eps,2 ).translate( [ 0,0,3.5 ] ) )
  .add( cylinder( 8,3.25 ).translate( [ 0,0,6.5 ] ) )
  .add( cube( [ 2.54,2,3+eps ],true ).translate( [ 0,0,14.5+1.5-eps ] ) )
  .translate( [ 0,0,-(3.5+3) ] )
  .rotate( [ 0,90,0 ] )
  .rotate( [ 0,-phi,0 ] )
  .translate( [ r7,0,hs2 ] )
}

function cable_slot( ) {
 return cube( [ 2*rc0+eps,button_actor_width( ),ho4 ] )
  .translate( [ r7+hs1-2*rc0,-button_actor_width( )-wall_strength( )-eps,ho2-2*rc0 ] )
}

function cable_complement_mask( ) {
 const side_margin = 2*edge_margin

 return cube( [ ( speakers_dist-inlet_dist )+rc1+rc2+2*side_margin,wall_strength( )+2*eps,ho4 ] )
  .translate( [ inlet_dist-rc2-side_margin,-rr2-wall_strength()-eps,hc ] )
  .rotate( [ 0,0,right_edge_angle( ) ] )
  .translate( retainer_center( ).concat( [0] ) ) 
  .add(
   cube( [ 2*(rc0+side_margin),wall_strength( )+2*eps,ho4 ] )
    .translate( [ -mic_dist-rc0-side_margin,-rr2-wall_strength( )-eps,hc ] )
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
   square( [ 4*wall_strength( ),2*wall_strength( ) ] )
    .translate( [ ( r5+r7)/2+2*wall_strength( ),button_actor_width( )+0*wall_strength( ) ] )
  )
  .extrude( ho4 )
  .translate( [ 0,0,ho2 ] )
}

function cable_cavity( ) {
 const holder_strength = button_actor_width( ) - rs1 - edge_margin/2
 const rail_height = mediator.altitude + mediator.height - hi0
 
 const rail = cube( [ 2*edge_margin+eps,holder_strength+eps,rail_height+eps ] )
  .translate( [ r7+hs1-2*edge_margin,rs1+edge_margin/2,hi0-eps ] )
 
 const action_incision_neg = cube( [ r7+hs1,2*button_actor_width( ),ho4+2*eps ] ).translate( [ 0,-button_actor_width( ),-eps ] )

 return cavity = top_neg_cs.intersect( chassis( ) )
  .subtract( circle( r5 ) )
  .offset( -wall_strength( ) )
  .extrude( ho4+2*eps ).trimByPlane( [ 0,-1,0] )
  .translate( [ 0,0,-eps ] )
  .subtract(
   cube( [ 2*hs1,wall_strength( ),ho4+2*eps ] )
    .translate( [ r5,-button_actor_width( )-wall_strength( ),-eps ] )
    .subtract( cable_slot( ) )
  )
  .add( action_incision_neg  )
  .subtract( rail )
  .subtract( rail.mirror( [ 0,1,0 ] ) )
}

function wall( ) {
  return chassis_total( )
   .subtract( top_cover_mask( ) )
   .subtract( cable_cavity( ) )
   .subtract( cable_complement_mask( ) )
   .subtract( cylinder( ho4,rr2 ).translate( retainer_center( ).concat( [0] ) ) )
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
  
 return chassis_total( ).intersect(
  top_cover_mask( )
  .add( cable_complement_mask( ).subtract( cable_cavity( ) ) )
 )
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

function pswitch_holder( ) {
 const s = switchframe
 const railplane = cube( [ 2*(s.length+eps),2*(button_actor_width( )+eps ),2*( mediator.height+mediator.altitude ) ],true )
 
 return cube( [ s.wall+eps,2*(button_actor_width( )+eps),ho4 ] )
  .translate( [ -s.wall/2-eps,-button_actor_width( )-eps,-ho4/2 ] )
  .subtract(
   cylinder( s.length,s.radius )
   .rotate( [ 0,90,0 ] )
   .translate( [ -s.wall,0,0 ] )
  )
  .translate( [ s.wall/2,0,-s.space ] )
  .rotate( [ 0,-phi,0 ] )
  .trimByPlane( [ 0,0,-1 ] )
  .add(
   cube( [ 2*(s.length+eps),2*(button_actor_width( )+eps),ho4 ],true )
   .subtract(
    cube( [ 2*s.length+4*eps,2*s.space,ho4+2*eps ],true )
    .translate( [ eps,0,0 ] )
   )
   .translate( [ s.length,0,0 ] )
   .rotate( [ 0,-phi,0 ] )
   
   .rotate( [ 0,phi,0 ] ).translate( [ 0,0,s.space ] ).rotate( [ 0,-phi,0 ] )
   .translate( [ 0,0,s.y+hi0 ] )
   .subtract( railplane )
   .translate( [ 0,0,-s.y-hi0 ] )
   .rotate( [ 0,phi,0 ] ).translate( [ 0,0,-s.space ] ).rotate( [ 0,-phi,0 ] )
  )
  .rotate( [ 0,phi,0 ] )
  .trimByPlane( [ 1,0,0 ],0 )
  .rotate( [ 0,90-printing_angle,0 ] )
  .trimByPlane( [ 0,0,-1 ],0 )
  .rotate( [ 0,printing_angle-90,0 ] )
  .translate( [ -s.wall,0,s.space ] )
  .rotate( [ 0,-phi,0 ] )
  .trimByPlane( [ 0,0,1 ],-s.y )
  .trimByPlane( [ 0,0,-1 ],-ho2+hi0+s.y )
  .trimByPlane( [ -1,0,0 ],-s.length )
  .trimByPlane( [ 0,1,0 ],-button_actor_width( ) )
  .trimByPlane( [ 0,-1,0 ],-button_actor_width( ) )
  .translate( [ 0,0,s.y+hi0 ] )
  .subtract( railplane.subtract( cube( [ 2*s.wall,2*s.space,ho4 ],true ) ) )
  .translate( [ s.x,0,0 ] )

}

function base_lock_mask( ) {
 function sect_mask( a,a0 ) {
  return sector( a,ho4 ).rotate( a0 ).extrude( ho4+2*eps ).translate( [ 0,0,-eps ] )
   .subtract( cylinder( ho4,eps ).translate( [ 0,0,-ho4/2 ] ) )
 }

 const outer = r3+(hi0-2*edge_margin)/tan(printing_angle)
 
 const ret_below = square( 2*r3 ).translate( [ -3/2*r3,-2*r3 ] )
  .rotate( -printing_angle )
  .translate( [ outer,edge_margin ] )
  .revolve( )
  .intersect( cylinder( ho4+eps,outer ).translate( [ 0,0,-eps ] ) )
  .add( cylinder( ho4+eps,r3 ).translate( [ 0,0,-eps ] ) )
//  .trimByPlane( [ 0,0,-1 ],-hi0-eps )
  
 const ret_above = ret_below.mirror( [ 0,0,1 ] ).translate( [ 0,0,hi0 ] )
 const ret_none = cylinder( hi0+2*eps,outer ).translate( [ 0,0,-eps ] )
 const ret_full = cylinder( hi0+2*eps,r2 ).translate( [ 0,0,-eps ] )
 
 return { sect_mask,ret_above,ret_below,ret_none,ret_full }
}

function bottom_cover( ) { 
 const { sect_mask,ret_above,ret_below,ret_none,ret_full }= base_lock_mask( )
 const delta_theta = Math.max( 45/2-asin( button_actor_width( )/r3 ),0 )
 
 const mask = ret_above.intersect( ret_below )
 .add(
  ret_above.intersect(
   sect_mask( 45+90,90-45/2 )
   .add( sect_mask( 45+90-delta_theta,3*90-45/2+delta_theta ) )
  )
 )
 .add(
  ret_below.intersect( 
   sect_mask( 45,45/2 ).add( sect_mask( 45+delta_theta,180+45/2 ) )
  )
 )
 .add( ret_none.intersect( sect_mask( 45+delta_theta,-45/2-delta_theta ) ) )
 .add( ret_none.intersect( sect_mask( 45+delta_theta,180-45/2-delta_theta ) ) )
 
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
  .subtract( shield_neg_alpha )
  .subtract( shield_neg_beta )
  .subtract( mask )
  .subtract(
   cube( [ r7+hs1-2*edge_margin,2*button_actor_width( ),hi1 ] )
   .translate( [ 0,-button_actor_width( ),mediator.altitude ] )
   .subtract(
    cube( [ hs1+hs3+eps,2*rs1+edge_margin,ho4 ] )
    .translate( [ r7-hs3,-rs1-edge_margin/2,0 ] )
   )
  ) 
}

const stators = [
 pswitch( )
 ,wall( )
 ,main_retainer( )
 ,bottom_cover( )
 ,top_cover( )
 ,pswitch_holder( )
 ,base_disk( )
 ,retainer( true )
 ,retainer( true ).rotate( [ 0,0,180 ] )
]

const push_angle = 0*alpha
const bump = 0

const rotors = [
 ,button( push_angle )
 ,slider( )
 ,top_lever( true,push_angle,bump )
 ,top_lever( false,push_angle,bump ).mirror( [ 1,0,0 ] )
 ,turntable( )
 ,turntable_pin( )
 ,cap_bottom( )
 ,cap_top( )
 ,cap_bottom( ).mirror( [ 1,0,0 ] )
 ,cap_top( ).mirror( [ 1,0,0 ] )
 ,bottom_lever( push_angle,bump )
 ,bottom_lever( push_angle,bump ).mirror( [ 1,0,0 ] )
]

export default  [
 bottom_cover()
 ,c(retainer(false))
 ,c(retainer( true ).rotate( [ 0,0,180 ] ))
 ,c(base_disk())

]
/*export default (
 rotors.map (
  (o) => o.rotate( [ 0,0,90 ] )
 )
  .concat ( stators )
  .map (
   (o) => c( o.trimByPlane( [ 0,1,0 ],0 ) )
  )
)//*/
