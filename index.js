/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */
/**
 The MIT License (MIT)

 Copyright (c) 2016 @biddster

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

module.exports = function (RED) {
    const _ = require('lodash');

    RED.nodes.registerType('topic-timeframe-trigger', function (config) {
        RED.nodes.createNode(this, config);

        // eslint-disable-next-line consistent-this
        const node = this;
        const globalConfig = {
            debug: false,
        };
        let triggers = null;
        let timeout = null;

        const getGlobalConfig = function () {
            return _.assign(globalConfig, node.context().global.get('topic-timeframe-trigger'));
        };

        const debug = function () {
            if (getGlobalConfig().debug) {
                node.log.apply(node, arguments);
            }
        };

        const reset = function () {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }

            triggers = null;
            node.status({
                fill: 'blue',
                shape: 'dot',
                text: 'Idle',
            });
            debug('Timeframe reset after ' + config.timeframe + 's');
        };

        node.on('input', (msg) => {
            if (!msg.topic) {
                node.error('Message has no topic: ' + msg.payload);
                node.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'Msg has no topic',
                });
                return;
            }

            if (!triggers) {
                timeout = setTimeout(reset, config.timeframe * 1000);
                triggers = [];
            }

            triggers.push(msg);

            const grouped = _.groupBy(triggers, 'topic');
            const countExceeded = _.filter(grouped, (msgs) => {
                return msgs.length >= config.count;
            });
            if (countExceeded.length >= config.topics) {
                debug('Triggered by count: ' + countExceeded.length);
                node.send({
                    topic: config.triggeredtopic,
                    payload: config.triggeredpayload,
                    triggers,
                });
                reset();
                // node.status({fill: 'green', shape: 'dot', text: 'Triggered: ' + config.triggeredtopic});
            } else {
                debug('Msg received: ' + msg.topic + ' => ' + grouped[msg.topic].length);
                node.status({
                    fill: 'green',
                    shape: 'dot',
                    text: msg.topic + ':' + grouped[msg.topic].length,
                });
            }
        });

        node.on('close', reset);
        node.status({
            fill: 'blue',
            shape: 'dot',
            text: 'Idle',
        });
    });
};
