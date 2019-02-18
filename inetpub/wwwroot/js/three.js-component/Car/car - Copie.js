/*
 * damien leroux car display
 * version 1.0.0.0
 *
 * Available car parts:
 *   front
 *   front.glass
 *   front.hood
 *   front.left
 *   front.left.door
 *   front.left.door.glass
 *   front.left.light
 *   front.left.wheel
 *   front.right
 *   front.right.door
 *   front.right.door.glass
 *   front.right.light
 *   front.right.wheel
 *   rear
 *   rear.glass
 *   rear.left.door.glass
 *   rear.left.door
 *   rear.left
 *   rear.left.light
 *   rear.left.wheel
 *   rear.right.door.glass
 *   rear.right.door
 *   rear.right
 *   rear.right.light
 *   rear.right.wheel
 *   rear.trunk
 *   roof
 */
 
(function($){
  $.fn.display3DCar = function(container,AllowSelection,damagecarPartsTitle,carOriginColor,carDamageColor) {
    var camera, scene, renderer;

    var damagecarParts = [];
    var carParts = [];
    var projector;
    var radius=8;
    var cameraRotation=-1.0;
    var firstPageX = 0,firstPageY= 0,currentPageX=0;
    init();
    animate();

    function createLoadScene() {
      var result = {
        scene:  new THREE.Scene(),
        camera: new THREE.PerspectiveCamera( 65, container.clientWidth / container.clientHeight, 1, 1500 )
      };
      camera = result.camera;
      camera.position.y = radius/2;
      camera.position.x = radius * Math.cos( cameraRotation );
      camera.position.z =radius* Math.sin( cameraRotation );
      result.scene.add( camera );

      result.scene.matrixAutoUpdate = false;

      var color = 0x888888;
      var light = new THREE.PointLight( 0xCCCCCC );
      light.position.x = 0;
      light.position.y = 100;
      light.position.z = 0;
      result.scene.add( light );

      light = new THREE.DirectionalLight( color  );
      light.position.x = camera.position.x + 50;
      light.position.z = camera.position.y + 50;
      light.position.y = 50;
      result.scene.add( light );

      light = new THREE.DirectionalLight( color  );
      light.position.x = camera.position.x - 50;
      light.position.z = camera.position.y - 50;
      result.scene.add( light );

      light = new THREE.DirectionalLight( color  );
      light.position.x = camera.position.x + 50;
      light.position.z = camera.position.y - 50;
      result.scene.add( light );

      light = new THREE.DirectionalLight( color  );
      light.position.x = camera.position.x - 50;
      light.position.z = camera.position.y + 50;
      result.scene.add( light );

      return result;
    }

    function init() {
      var loadScene = createLoadScene();
      scene = loadScene.scene;
      projector = new THREE.Projector();

      var callbackFinished = function ( result ) {
        result.scene.traverse( function ( object ) {
          if ( object instanceof THREE.Mesh ) {
            object.material.materials[0].color.setHex(carOriginColor);
            carParts.push(object);
          }
        });
      };

      /*load scene*/
      var loader = new THREE.SceneLoader();
      loader.load('./js/three.js-component/Car/carParts/car.js', callbackFinished);

      renderer = new THREE.WebGLRenderer( { antialias: true } );
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.domElement.style.position = "relative";
      renderer.gammaInput = true;
      renderer.gammaOutput = true;
      renderer.setClearColor(new THREE.Color(0xffffff));

      container.appendChild( renderer.domElement );
      container.addEventListener( 'resize', onWindowResize, false );
      container.addEventListener( 'mousedown', mousedown, false );
      
    }

    function onWindowResize() {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( container.clientWidth, container.clientHeight );
    }

    function mousedown( event ) {
      event.preventDefault();
      event.stopPropagation();
      currentPageX = event.pageX;
      firstPageX = currentPageX;
      firstPageY = event.pageY;
      document.addEventListener( 'mousemove', mousemove, false );
      document.addEventListener( 'mouseup', mouseup, false );
    }

    function mousemove( event ) {
      event.preventDefault();
      event.stopPropagation();
      cameraRotation+=degInRad(event.pageX-currentPageX)/2  ;
      camera.position.x = radius * Math.cos( cameraRotation );
      camera.position.z =radius* Math.sin( cameraRotation );
      currentPageX = event.pageX
    }

    function mouseup( event ) {
      event.preventDefault();
      event.stopPropagation();
      document.removeEventListener( 'mousemove', mousemove );
      document.removeEventListener( 'mouseup', mouseup );

      //Select car damage
      if (AllowSelection == true)
        if (firstPageX == event.pageX && firstPageY == event.pageY){
          var elem = renderer.domElement;
          var boundingRect = elem.getBoundingClientRect();
          var X = (event.clientX - boundingRect.left) * (elem.width / boundingRect.width);
          var Y = (event.clientY - boundingRect.top) * (elem.height / boundingRect.height);
          var mouseX = ( X / elem.width ) * 2 - 1;
          var mouseY = -( Y / elem.height ) * 2 + 1;
          var vector = new THREE.Vector3( mouseX, mouseY, camera.near );
          projector.unprojectVector( vector, camera );

          var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

          var intersects = raycaster.intersectObjects( carParts );

          if ( intersects.length > 0 ) {
            if (intersects[ 0 ].object.material.materials[0].color.getHex() == carDamageColor)
              intersects[ 0 ].object.material.materials[0].color.setHex(carOriginColor);
            else
              intersects[ 0 ].object.material.materials[0].color.setHex(carDamageColor);
          }
        }

    }

    function animate() {
      requestAnimationFrame( animate );
      render();
    }

    function degInRad(deg) {
        return deg * Math.PI / 180;
    }  

    function render() {
      var camTarget = new THREE.Vector3(0,-2,0);
      camera.lookAt( camTarget );

      for ( carPart in carParts) {
        for ( damagecarPartKey in damagecarPartsTitle) {
          if (carParts[carPart].name == damagecarPartsTitle[damagecarPartKey]){
            carParts[carPart].material.materials[0].color.setHex(carDamageColor);
          }
        }
        scene.add(carParts[carPart]);
      }
      renderer.render( scene, camera );
    }
  }
})(jQuery);   
