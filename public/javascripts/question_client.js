$(function() {
  $('.question-like-btn').click(function(e) {
    var $el = $(e.currentTarget);
    if ($el.hasClass('loading')) return;
    $el.addClass('loading');
    $.ajax({
      url: '/api/questions/' + $el.data('id') + '/like',
      method: 'POST',
      dataType: 'json',
      success: function(data) {
        $('.question .num-likes').text(data.numLikes);
        $('.question-like-btn').hide();
      },
      error: function(data, status) {
        if (data.status == 401) {
          alert('Login required!');
          location = '/signin';
        }
        console.log(data, status);
      },
      complete: function(data) {
        $el.removeClass('loading');
      }
    });
  });

  $('.answer-like-btn').click(function(e) {
    var $el = $(e.currentTarget);
    if ($el.hasClass('disabled')) return;
    $.ajax({
      url: '/api/answers/' + $el.data('id') + '/like',
      method: 'POST',
      dataType: 'json',
      success: function(data) {
        $el.parents('.answer').find('.num-likes').text(data.numLikes);
        $el.addClass('disabled');
      },
      error: function(data, status) {
        if (data.status == 401) {
          alert('Login required!');
          location = '/signin';
        }
        console.log(data, status);
      }
    });
  });
  $('.btn.btn-primary.btn-sm').click(function(e){
    var html= `.nav.nav-pill`
    var $el=$(e.currentTarget);// event값의 전체 반환
    console.log($el);
    $.ajax({
      url:'/api/answers/'+$el.data('id')+'/edit',
      method: 'GET',
      dataType:'json',
      success: function(data){
        var content='<form action=/questions/'+$el.data('id')+'/answers/edit?_method=PUT, method="POST">' +
        ' <div class="form-group">'+
        '   <textarea class="form-control" id="editor" name="noticeContent">'+data.content+'</textarea>' +
        ' </div>' +
        ' <button class="btn btn-warning" type="submit">수정완료</button>'+
        ' <button class="btn btn-danger" onclick="window.location.reload()">취소</button>' +
        '</form>';

    //    $el.parents('.answer.card').find('.content').hide().wrap('<textarea class="form-control" id="editor" name="noticeContent">'+data.content);
        $el.parents('.answer.card').find('.content').replaceWith(content);
        $el.parents('.nav.nav-pill').empty();
      //  CKEDITOR.replace('editor');
    //    $el.parents('.nav.nav-pill').find('.btn.btn-danger.btn-sm').hide().wrap('<button type="button" class="btn btn-danger">취소</button>');
    //    $el.parents('.nav.nav-pill').find('.btn.btn-primary.btn-sm').hide().wrap('<button type="button class=btn btn-warning">수정완료</button>')
    //    $el.unwrap().wrap('<form action="/questions/"'+$el.data('id')+'/edit method="PUT">');
      //  $el.unwrap().wrap('<form action="/questions/"'+$el.data('id')+'/edit method="PUT"');
    //    $el.unwrap().wrap('<button type="button" class="btn btn-warning" type="submit">수정완료</button>');

      //  $el.parents('.answer.card').find('.content').hide().wrap('<textarea class="form-control" id="editor" name="noticeContent">'+data.content);
        CKEDITOR.replace('editor');
      }
    });
  });

});
