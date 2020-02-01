$(function() {
  $('.need-confirm-btn').click(function() {
    if (confirm('Are you sure to delete?')) {
      return true;
    }
    return false;
  });
  $('.btn-example').click(function(){
          var $href = $(this).attr('href');
          layer_popup($href);
      });
      function layer_popup(el){

          var $el = $(el);        //레이어의 id를 $el 변수에 저장
          var isDim = $el.prev().hasClass('dimBg');   //dimmed 레이어를 감지하기 위한 boolean 변수

          isDim ? $('.dim-layer').fadeIn() : $el.fadeIn();

          $el.find('a.btn-layerClose').click(function(){
              isDim ? $('.dim-layer').fadeOut() : $el.fadeOut(); // 닫기 버튼을 클릭하면 레이어가 닫힌다.
              return false;
          });

          $('.layer .dimBg').click(function(){
              $('.dim-layer').fadeOut();
              return false;
          });

      }

});
