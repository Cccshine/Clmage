var CI = new CImage({
    element: document.getElementById('cimage'),
    createHandles: ['n', 's', 'e', 'w', 'ne', 'se', 'sw', 'nw'],
    aspectRatio: 1,
    previewSize: [200, 100, 50],
    minSize: [20, 20],
    onChange: function(){
        var info = CI.getSelectInfo();
        console.log(info);
    },
    onSelect: function(){
        console.log('select')
    },
    onRelease:function(){
        console.log('release')
    }
});