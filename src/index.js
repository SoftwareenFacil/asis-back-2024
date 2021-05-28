import '@babel/polyfill';

import appserver from './server';
// import { connect } from "./database";

async function main(){
    await appserver.listen(appserver.get('port'))
    // await connect()
    console.log('Server on port ', appserver.get('port'));
}

main()