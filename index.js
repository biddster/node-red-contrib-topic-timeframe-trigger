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
    'use strict';

    var _ = require("lodash");

    RED.nodes.registerType('topic-timeframe-trigger', function (config) {
        RED.nodes.createNode(this, config);
        var node = this,
            topics = null,
            timeout = null;

        node.on('input', function (msg) {
            if (!msg.topic) {
                node.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'Msg has no topic'
                });
                return;
            }
            if (!topics) {
                timeout = setTimeout(reset, config.timeframe * 1000);
                topics = {};
            }
            var topicCount = topics[msg.topic];
            topics[msg.topic] = !topicCount ? 1 : topicCount + 1;

            var countExceeded = _.filter(topics, function (count) {
                return count >= config.count;
            });
            if (countExceeded.length >= config.topics) {
                reset();
                node.send({
                    topic: config.triggeredtopic,
                    payload: config.triggeredpayload
                });
                // node.status({fill: 'green', shape: 'dot', text: 'Triggered: ' + config.triggeredtopic});
            } else {
                node.status({
                    fill: 'green',
                    shape: 'dot',
                    text: msg.topic + ':' + topics[msg.topic]
                });
            }
        });

        node.on('close', reset);
        node.status({
            fill: 'blue',
            shape: 'dot',
            text: 'Idle'
        });

        function reset() {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            topics = null;
            node.status({
                fill: 'blue',
                shape: 'dot',
                text: 'Idle'
            });
        }
    });
};