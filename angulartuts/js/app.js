(function () {
    var app = angular.module('store', []);

    app.controller('StoreController', function () {
        this.products = gems;
    });

    app.controller('PanelController', function () {
        this.tab = 1;
        this.selectTab = function (setTab) {
            this.tab = setTab;
        }

        this.isSelected = function (checkTab) {
            return this.tab === checkTab;
        }
    });
    app.controller('ReviewController', function () {
        this.review = {};
        this.addReview = function (product) {
            product.reviews.push(this.review);
            this.review = {};
        };
    });

    app.directive('productTitle', function () {
        return {
            restrict: 'E',
            templateUrl: 'product-title.html'
        };
    });
    
    var gems= [{
        name : 'Dodecahedron',
        price : 2.95,
        description : ' ....',
        canPurchase : true,
        soldOut: true,
        reviews : [{
            stars: 5,
            body: "meh",
            author: "someone@someon.com"
        },
        {
            stars: 0,
            body: "masadeh",
            author: "somdseone@someon.com"
        }],
        hasNoReviews : function () {
            return this.reviews.count === 0;
        }
    },
    {
        name : 'Pentagonal gem',
        price : 5.95,
        description : ' ....',
        canPurchase : false,
        soldOut: true,
        reviews : []
    }];


})();