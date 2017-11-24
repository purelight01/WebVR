require.config({ // baseUrl: "." });
    });

function onModuleNotification(): void {
    console.log('module notification');
}

//
// The first Module(s) to be loaded
//
require(['Main'], onModuleNotification);