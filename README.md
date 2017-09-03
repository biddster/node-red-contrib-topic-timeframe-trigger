# node-red-contrib-topic-timeframe-trigger

Node-RED node which observes input topics and only produces an output if n distinct topics are received n times each within the specified time frame.

### Installation
 
Change directory to your node red installation:

    $ npm install node-red-contrib-topic-timeframe-trigger
 
### Outputs

When enough messages are received to trigger, a message is output as per the configuration. In addition, all of the messages received within the
timeframe are added to the message as an array property called `triggers`.

### Enabling extra debugging

Install `node-red-contrib-config` and drag a config node into your workspace. Configure the node to set a global variable called `topic-timeframe-trigger` 
with a JSON value of `{"debug": true}`. Also make sure that the config tickbox for `active` is unchecked. Redeploy. Now click the button on the config node. 
This will trigger all instances of `topic-timeframe-trigger` to write extra logging to the os syslog next time they're invoked.
