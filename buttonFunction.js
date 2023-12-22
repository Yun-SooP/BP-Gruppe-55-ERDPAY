document.addEventListener('DOMContentLoaded', init, false);
function init(){
  function message () {
    alert(privateKey);
  }
  var button = document.getElementById('button');
  button?.addEventListener('click', message, true);
};