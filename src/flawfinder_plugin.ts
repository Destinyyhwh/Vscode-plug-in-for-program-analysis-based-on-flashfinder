import * as vscode from 'vscode';
import * as fs from 'fs';

var PROTO_PATH = __dirname + '/flawfinder_plugin.proto';
var grpc = require('./node_modules/@grpc/grpc-js');
var protoLoader = require('./node_modules/@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var flawfinderProto = grpc.loadPackageDefinition(packageDefinition).flawfinder_plugin;

var temp:number;

function Client_fun(path:string) {
	
	
    var ip = "localhost";
    var port = "50051";
    var client = new flawfinderProto.flawfinder(`${ip}:${port}`, grpc.credentials.createInsecure())
    //console.error(`[+]Succesfully connected on Server ${ip}:${port}!`);
	vscode.window.showInformationMessage(`SSSSSSSSSSSSuccesfully connected on Server ${ip}:${port}!`);
	var filename = "./demo.c";
	 //读出要审计的C/C++代码
	var data = fs.readFileSync("demo.c");
	

	const opt = {
		flag : 'w',
	}
    client.execute({ Data: data }, function(err:any, response:any) {
        if (err) {
            console.error('Error: ', err)
			//vscode.window.showInformationMessage('Error: ', err);
        } else {
          //将字符串转化为json对象数组
          	var content = JSON.parse(response.json);
			temp = content.length;
            for(var index = 1 ; index <= content.length ; index++){
				let jsonFilename = __dirname + `/Analysis_${index}.json`;
                //将JSON对象数组中的元素转化为JSON格式的字符串
				fs.writeFile(jsonFilename,JSON.stringify(content[index-1],null,'\t'),opt,(err) => {
            		if (err){
                		console.error('Error: ', err);
						//vscode.window.showInformationMessage('Error: ', err);
            		}
            	});
          	}
        }
        console.error(response.msg + `for ${filename}!`);
    })
	const fileUri = vscode.Uri.file(__dirname + '/Server/Analysis_Report.csv');
	vscode.commands.executeCommand('vscode.openFolder',fileUri);
}




function activate(context:vscode.ExtensionContext) {
    console.log('插件已经被激活');
	const fileUri = vscode.Uri.file(__dirname + '/Client/demo.c');
	vscode.commands.executeCommand('vscode.openFolder',fileUri);

    // 注册命令
    let commandOfVulnerabilityCheck = vscode.commands.registerCommand('Vulnerability_check', uri => {
		if(!uri){
			vscode.window.showInformationMessage("当前文件路径是：空",'确定','取消').then(function(select){});
		}
        //文件路径
		else{
			//vscode.window.showInformationMessage(`${uri.path.substring(1)}`);
			const filePath = uri.path.substring(1);
			Client_fun(filePath);
			const opc = vscode.window.createOutputChannel('output'); // 可以有多个OutputChannel共存，使用参数名区分
			opc.clear(); // 清空
			//vscode.window.showInformationMessage(`${temp}`);
			for(var index = 1 ; index <= temp ; index++){
				//opc.appendLine(`${temp}`);
				//vscode.window.showInformationMessage(temp);
				if (fs.existsSync(__dirname + `/Client/Analysis_${index}.json`)) //判断是否存在此文件
				{
					//读取文件内容，并转化为Json对象
					let userBugsJson = JSON.parse(fs.readFileSync(__dirname + `/Client/Analysis_${index}.json`, "utf8"));
					const line = userBugsJson['Line'];
					//opc.appendLine(line);
					const column = userBugsJson['Column'];
					const level = userBugsJson['Level'];
					const suggestion = userBugsJson['Suggestion'];
					const warning = userBugsJson['Warning'];
					opc.appendLine(`[行 ${line}, 列 ${column}] 警告: ${warning} 解决建议: ${suggestion}`); // 追加一行
					opc.show(); // 打开控制台并切换到OutputChannel tab
				}
			}
			vscode.window.showInformationMessage(`
				文件漏洞分析已完毕;
				此csv文件为分析结果;
				具体请见输出;
			`, { modal: true });
		}
    });
    // 将命令放入其上下文对象中，使其生效
    context.subscriptions.push(commandOfVulnerabilityCheck);
}

// this method is called when your extension is deactivated
function deactivate() {}
module.exports = {
    activate,
    deactivate
}