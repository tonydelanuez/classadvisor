var app = angular.module('classadvisor', ['ui.router']);
app.config(['$stateProvider','$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$stateProvider.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl', 
			resolve: {
				postPromise: ['posts', function(posts){
					return posts.getAll();
				}]
			}
		}).state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html', 
			controller: 'PostsCtrl',
			resolve: {
				post: ['$stateParams', 'posts', function($stateParams, posts) {
					return posts.get($stateParams.id);
				}]
			}
		})
		.state('login', {
			url: '/login',
			templateUrl: '/login.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'auth', function($state, auth){
				if(auth.isLoggedIn()){
					$state.go('home');
				}
			}]
		}).state('register', {
			url: '/register',
			templateUrl: '/register.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'auth', function($state, auth){
				if(auth.isLoggedIn()){
					$state.go('home');
				}
			}]
		}).state('courses', {
			url: '/courses/{id}',
			templateUrl: '/courses.html', 
			controller: 'CoursesCtrl',
			resolve: {
				course: ['$stateParams', 'courses', function($stateParams, courses) {
					return courses.get($stateParams.id);
				}]
			}
		});
		$urlRouterProvider.otherwise('home');
	}]);

app.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};

	auth.saveToken = function (token){
		$window.localStorage['flapper-news-token'] = token;
	};

	auth.getToken = function (){
		return $window.localStorage['flapper-news-token'];
	}

	auth.isLoggedIn = function(){
		var token = auth.getToken();

		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUser = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};
	auth.register = function(user){
		return $http.post('/register', user).success(function(data){
			auth.saveToken(data.token);
		});
	};
	auth.logIn = function(user){
		return $http.post('/login', user).success(function(data){
			auth.saveToken(data.token);
		});
	};
	auth.logOut = function(){
		$window.localStorage.removeItem('flapper-news-token');
	};

	return auth;
}])

app.factory('posts', ['$http', 'auth', function($http, auth){
	//service body
	var o = {
		posts: []
	};
	o.getAll = function() {
		return $http.get('/posts').success(function(data){
			angular.copy(data, o.posts);
		});
	};
	o.create = function(post) {
		return $http.post('/posts', post, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			o.posts.push(data);
		});
	};


	o.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote', null, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			post.upvotes += 1;
		});
	};
	o.downvote = function(post) {
		return $http.put('/posts/' + post._id + '/downvote', null, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			post.upvotes -= 1;
		});
	};
	o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res){
			return res.data;
		});
	};

	o.addComment = function(id, comment) {
		return $http.post('/posts/' + id + '/comments', comment, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		});
	};
	o.addCourse = function(id, course) {
		return $http.post('/posts/' + id + '/courses', course, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		});
	};
	o.upvoteComment = function(post, comment) {
		return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote', null, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			comment.upvotes += 1;
		});
	};

	return o;
}]);

// app.factory('courses', ['$http', 'auth', function($http, auth){
// 	//service body
// 	var o = {
// 		courses: []
// 	};
// 	o.getAll = function() {
// 		return $http.get('/courses').success(function(data){
// 			angular.copy(data, o.courses);
// 		});
// 	};
// 	o.create = function(course) {
// 		return $http.post('/courses', course, {
// 			headers: {Authorization: 'Bearer '+auth.getToken()}
// 		}).success(function(data){
// 			o.courses.push(data);
// 		});
// 	};


// 	o.upvote = function(course) {
// 		return $http.put('/courses/' + post._id + '/upvote', null, {
// 			headers: {Authorization: 'Bearer '+auth.getToken()}
// 		}).success(function(data){
// 			course.upvotes += 1;
// 		});
// 	};
// 	o.downvote = function(course) {
// 		return $http.put('/courses/' + post._id + '/downvote', null, {
// 			headers: {Authorization: 'Bearer '+auth.getToken()}
// 		}).success(function(data){
// 			course.upvotes -= 1;
// 		});
// 	};
// 	o.get = function(id) {
// 		return $http.get('/courses/' + id).then(function(res){
// 			return res.data;
// 		});
// 	};

// 	o.addComment = function(id, comment) {
// 		return $http.post('/courses/' + id + '/comments', comment, {
// 			headers: {Authorization: 'Bearer '+auth.getToken()}
// 		});
// 	};
// 	o.upvoteComment = function(course, comment) {
// 		return $http.put('/courses/' + post._id + '/comments/'+ comment._id + '/upvote', null, {
// 			headers: {Authorization: 'Bearer '+auth.getToken()}
// 		}).success(function(data){
// 			comment.upvotes += 1;
// 		});
// 	};

// 	return o;
// }]);

app.controller('MainCtrl', ['$scope','posts', 'auth', 
	function($scope, posts, auth){
		$scope.posts = posts.posts;
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.title = '';
		$scope.link = '';

		$scope.addPost = function(){
	  	//sentinel to prevent empty titles
	  	if(!$scope.title || $scope.title === '') {
	  	 return; 
	  	}
	  	posts.create({
	  		title: $scope.title,
	  		link: $scope.link,
	  		major: $scope.major,
	  		course: $scope.course, 
	  		description: $scope.description,
	  		courses: [$scope.course1, $scope.course2, $scope.course3, $scope.course4, $scope.course5]
	  	});

	  	$scope.title = '';
	  	$scope.link = '';
  };
  $scope.incrementUpvotes = function(post) {
  	posts.upvote(post);
  };
  $scope.decrementUpvotes = function(post){
  	posts.downvote(post);
  };
}]);

app.controller('PostsCtrl', ['$scope', 'posts', 'post', 'auth',
	function($scope, posts, post, auth){
		$scope.post = post;
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.addComment = function(){
			if($scope.body === '') { return; }
			posts.addComment(post._id, {
				body: $scope.body,
				author: 'user',
			}).success(function(comment) {
				$scope.post.comments.push(comment);
			});
			$scope.body = '';
		};
		$scope.incrementUpvotes = function(comment){
			posts.upvoteComment(post, comment);
		};
		$scope.decrementUpvotes = function(comment){
			posts.downvoteComment(post, comment);
		};

	}]);
// app.controller('CoursesCtrl', ['$scope', 'courses', 'course', 'auth',
// 	function($scope, courses, course, auth){
// 		$scope.course = course;
// 		$scope.isLoggedIn = auth.isLoggedIn;
// 		// $scope.addComment = function(){
// 		// 	if($scope.body === '') { return; }
// 		// 	posts.addComment(post._id, {
// 		// 		body: $scope.body,
// 		// 		author: 'user',
// 		// 	}).success(function(comment) {
// 		// 		$scope.post.comments.push(comment);
// 		// 	});
// 		// 	$scope.body = '';
// 		// };
// 		$scope.incrementUpvotes = function(comment){
// 			courses.upvoteComment(course, comment);
// 		};
// 		$scope.decrementUpvotes = function(comment){
// 			courses.downvoteComment(course, comment);
// 		};

// 	}]);
app.controller('AuthCtrl', ['$scope', '$state', 'auth',
function($scope, $state, auth) {
	$scope.user = {};

	$scope.register = function() {
		auth.register($scope.user).error(function(error) {
			$scope.error = error;
		}).then(function() {
			$state.go('home');
		});
	};

	$scope.logIn = function() {
		auth.logIn($scope.user).error(function(error) {
			$scope.error = error;
		}).then(function() {
			$state.go('home');
		});
	};
}]);

app.controller('NavCtrl', [
	'$scope',
	'auth',
	function($scope, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
	}]);


