;(function(window, document) {

    var content = document.getElementById('content');
    var index   = document.getElementById('index');
  
	document.body.appendChild(index);
	document.body.appendChild(content);
		
	content.className = ' span8 offset4';
	index.className += ' span4';
	  
	const searchInput = document.querySelector('#search');
  
  
    function filterMenu() {
		
		if (this.value == '') {
			document.querySelectorAll(`a`).forEach(
				function(link) { 
					link.classList.remove("hide")
				}
			);
			return;
		} 
		
		document.querySelectorAll(`li>em>a, li>a`).forEach(
			function(link) { 
				link.classList.add("hide")
			}
		);
		
		document.querySelectorAll(`li>em>a[title*="${this.value}" i], li>a[title*="${this.value}" i]`).forEach(
			function(link) { 
				link.classList.remove("hide")
			}
		);
		
    }

	if (searchInput) {
		searchInput.addEventListener('change', filterMenu);
		searchInput.addEventListener('keyup', filterMenu);
	}
  
})(window, document);
