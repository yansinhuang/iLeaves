import httpClient from '../utils/httpClient';
import Config from '../config';
import { updateLeave, getLeave, getLeaves } from '../leave/leave';
import {
    getStaff
} from '../staff/staff'
import {
    getDepartment
} from '../department/department'
import {
  getLUser
} from '../staff/staff'
import {
    ErrorWithCode
} from '../utils/error';
var querystring = require('querystring'); 

const LINE_HEADER = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${Config.line.accessToken}`
};

export const EventType = {
    MESSAGE: 'message',
    POSTBACK: 'postback',
    ACCOUNTLINK: 'accountLink',
    FOLLOW: 'follow'
}

export const PostbackData = {
    PUNCHIN: 'punch in',
    BACK: 'back',
    SETTING: 'setting',
    SUBAPPROVE: /^action=同意&role=代理人.*/,
    SUPERAPPROVE: /^action=同意&role=主管.*/
}

// message handler
export const replyMessageEcho = async (event) => {
    try {
        var body = {
            replyToken: event.replyToken,
            messages: [
                {
                    type: 'text',
                    text: event.message.text
                }
            ]
        };
        var uri = Config.line.url + '/message/reply';
        return await httpClient.postjson(uri, body, LINE_HEADER);
    } catch (error) {
        throw(error);
    }
}

export const replyMessage = async (replyToken, message) => {
    try {
        var body = {
            replyToken: replyToken,
            messages: message
        };
        var uri = Config.line.url + '/message/reply';
        httpClient.postjson(uri, body, LINE_HEADER);
        return await httpClient.postjson(uri, body, LINE_HEADER);
    } catch (error) {
        throw(error);
    }
}

export const processPostbackData = async (data, userId) => {
    try {
        switch (data) {
            case PostbackData.PUNCHIN:
                return await switchMenuTo(userId, Config.richmenu.PUNCHIN);
            case PostbackData.SETTING:
                return await switchMenuTo(userId, Config.richmenu.SETTING);
            case PostbackData.BACK:
                return await switchMenuTo(userId, Config.richmenu.MAIN);
            case String(data.match(PostbackData.SUBAPPROVE)):
                return await approveLeaveSub(userId, data);
            case String(data.match(PostbackData.SUPERAPPROVE)):
                return await approveLeaveSuper(userId, data);
        }       
    } catch (error) {
        throw(error);
    }
}

export const switchMenuTo = async (userId, richmenuId) => {
    try {
        var uri = Config.line.url + `/user/${userId}/richmenu/${richmenuId}`;
        return await httpClient.postjson(uri, {}, LINE_HEADER);
    } catch (error) {
        throw(error);
    }
};

export const pushMessage = async (userId, messages, notificationDisabled = false) => {
    try {
        var uri = Config.line.url + '/message/push';
        const body = {
            to : userId,
            messages : messages,
            notificationDisabled : notificationDisabled
        }
        return await httpClient.postjson(uri, body, LINE_HEADER);
    } catch (error) {
        throw(error)
    }
}

const approveLeaveSub = async (userId, data) => {
    try {
        var parsedString = querystring.parse(data); 
        var ubn = parsedString.ubn;
        var leaveId = parsedString.leaveId;
        const leave = await getLeave(ubn, leaveId);
        if (leave.status != "等待簽核") {
            const messages = {
                "type": "text",
                "text": "此張假單已簽核"
            };
            pushMessage(userId, [messages]);
            //throw(ErrorWithCode('Leave has already been approved/rejected:' + leaveId));
        } else {
            var action = parsedString.action;
            var role = parsedString.role;
            var updateData = {
                "status": `${action} (${role})`
            }
            const result = await updateLeave(ubn, leaveId, updateData);
            const messages = {
                "type": "text",
                "text": "批准成功"
            };
            pushMessage(userId, [messages]);
            const substituteInfo = JSON.parse(leave.substitute);
            const substitute = await getStaff(ubn, substituteInfo.email);
            const selfStaff = await getStaff(ubn, leave.email);
            const self = await getStaff(ubn, leave.email);
            const department = await getDepartment(ubn, substitute.department);
            const supervisor = await getStaff(ubn, department.supervisor);
            const text = `開始日期：${leave.startDate}\n結束日期：${leave.endDate}\n假別：${leave.leaveType}\n請假原因：${leave.leaveReason}\n代理人：${substituteInfo.name}`;
           const message_self = {
                "type": "flex",
                "altText": "代理人已批准假單",
                "contents": {
                    "type": "bubble",
                    "styles": {
                    "footer": {
                        "separator": true
                    }
                    },
                    "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                        "type": "text",
                        "text": "代理人",
                        "weight": "bold",
                        "color": "#1DB446",
                        "size": "sm"
                        },
                        {
                        "type": "text",
                        "text": "已批准假單",
                        "weight": "bold",
                        "size": "xxl",
                        "margin": "md"
                        },
                        {
                        "type": "separator",
                        "margin": "xxl"
                        },
                        {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "xxl",
                        "spacing": "sm",
                        "contents": [
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                "type": "text",
                                "text": "開始日期",
                                "size": "sm",
                                "color": "#555555",
                                "flex": 0
                                },
                                {
                                "type": "text",
                                "text": leave.startDate,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            },
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                "type": "text",
                                "text": "結束日期",
                                "size": "sm",
                                "color": "#555555",
                                "flex": 0
                                },
                                {
                                "type": "text",
                                "text": leave.endDate,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            },
                            {
                            "type": "separator",
                            "margin": "xxl"
                            },
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "margin": "xxl",
                            "contents": [
                                {
                                "type": "text",
                                "text": "假別",
                                "size": "sm",
                                "color": "#555555"
                                },
                                {
                                "type": "text",
                                "text": leave.leaveType,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            },
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                "type": "text",
                                "text": "請假原因",
                                "size": "sm",
                                "color": "#555555"
                                },
                                {
                                "type": "text",
                                "text": leave.leaveReason,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            },
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                "type": "text",
                                "text": "代理人",
                                "size": "sm",
                                "color": "#555555"
                                },
                                {
                                "type": "text",
                                "text": substituteInfo.name,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            }
                        ]
                        },
                        {
                        "type": "separator",
                        "margin": "xxl"
                        },
                        {
                        "type": "box",
                        "layout": "horizontal",
                        "margin": "md",
                        "contents": [
                            {
                            "type": "text",
                            "text": "簽核狀態",
                            "size": "xs",
                            "color": "#555555",
                            "flex": 0
                            },
                            {
                            "type": "text",
                            "text": "同意(代理人)",
                            "color": "#1DB446",
                            "size": "xs",
                            "align": "end"
                            }
                        ]
                        }
                    ]
                    }
                }
            };
           const message_super = {
            "type": "flex",
            "altText": "[主管] 是否批准假單？",
            "contents": {
              "type": "bubble",
              "styles": {},
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "主管",
                    "weight": "bold",
                    "color": "#1DB446",
                    "size": "sm"
                  },
                  {
                    "type": "text",
                    "text": "是否批准假單？",
                    "weight": "bold",
                    "size": "xxl",
                    "margin": "md"
                  },
                  {
                    "type": "separator",
                    "margin": "xxl"
                  },
                  {
                    "type": "box",
                    "layout": "vertical",
                    "margin": "xxl",
                    "spacing": "sm",
                    "contents": [
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                          {
                            "type": "text",
                            "text": "請假者",
                            "size": "sm",
                            "color": "#555555"
                          },
                          {
                            "type": "text",
                            "text": selfStaff.name,
                            "size": "sm",
                            "color": "#111111",
                            "align": "end"
                          }
                        ]
                      },
                      {
                        "type": "separator",
                        "margin": "xxl"
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "margin": "xxl",
                        "contents": [
                          {
                            "type": "text",
                            "text": "開始日期",
                            "size": "sm",
                            "color": "#555555"
                          },
                          {
                            "type": "text",
                            "text": leave.startDate,
                            "size": "sm",
                            "color": "#111111",
                            "align": "end"
                          }
                        ]
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                          {
                            "type": "text",
                            "text": "結束日期",
                            "size": "sm",
                            "color": "#555555",
                            "flex": 0
                          },
                          {
                            "type": "text",
                            "text": leave.endDate,
                            "size": "sm",
                            "color": "#111111",
                            "align": "end"
                          }
                        ]
                      },
                      {
                        "type": "separator",
                        "margin": "xxl"
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "margin": "xxl",
                        "contents": [
                          {
                            "type": "text",
                            "text": "假別",
                            "size": "sm",
                            "color": "#555555"
                          },
                          {
                            "type": "text",
                            "text": leave.leaveType,
                            "size": "sm",
                            "color": "#111111",
                            "align": "end"
                          }
                        ]
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                          {
                            "type": "text",
                            "text": "請假原因",
                            "size": "sm",
                            "color": "#555555"
                          },
                          {
                            "type": "text",
                            "text": leave.leaveReason,
                            "size": "sm",
                            "color": "#111111",
                            "align": "end"
                          }
                        ]
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                          {
                            "type": "text",
                            "text": "代理人",
                            "size": "sm",
                            "color": "#555555"
                          },
                          {
                            "type": "text",
                            "text": substituteInfo.name,
                            "size": "sm",
                            "color": "#111111",
                            "align": "end"
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "type": "separator",
                    "margin": "xxl"
                  },
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "margin": "md",
                    "contents": [
                      {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "md",
                        "contents": [
                          {
                            "type": "button",
                            "style": "secondary",
                            "height": "sm",
                            "action": {
                              "type": "uri",
                              "label": "拒絕",
                              "uri": `line://app/${Config.liff.reject_super}?ubn=${ubn}&leaveId=${leave.id}`
                            }
                          }
                        ]
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "md",
                        "contents": [
                          {
                            "type": "button",
                            "style": "secondary",
                            "height": "sm",
                            "action": {
                              "type": "postback",
                              "label": "批准",
                              "data": `action=同意&role=主管&ubn=${ubn}&leaveId=${leave.id}`,
                              "text": "批准"
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
      };
            pushMessage(self.userId, [message_self]);
            pushMessage(supervisor.userId, [message_super]);
            return result;
        }
    } catch (error) {
        throw(error);
    }
};

const approveLeaveSuper = async (userId, data) => {
    try {
        var parsedString = querystring.parse(data); 
        var ubn = parsedString.ubn;
        var leaveId = parsedString.leaveId;
        const leave = await getLeave(ubn, leaveId);
        const substituteInfo = JSON.parse(leave.substitute);
        const self = await getStaff(ubn, leave.email);
        if (leave.status != "同意 (代理人)") {
            const messages = {
                "type": "text",
                "text": "此張假單已簽核"
            };
            pushMessage(userId, [messages]);
            //throw(ErrorWithCode('Leave has already been approved/rejected:' + leaveId));
        } else {
            var action = parsedString.action;
            var role = parsedString.role;
            var updateData = {
                "status": `${action} (${role})`,
            }
            const result = await updateLeave(ubn, leaveId, updateData);
            const messages = {
                "type": "text",
                "text": "批准成功"
            };
            pushMessage(userId, [messages]);
            const text = `開始日期：${leave.startDate}\n結束日期：${leave.endDate}\n假別：${leave.leaveType}\n請假原因：${leave.leaveReason}\n代理人：${substituteInfo.name}`;
            const message_self = {
                "type": "flex",
                "altText": "主管已批准假單",
                "contents": {
                    "type": "bubble",
                    "styles": {
                    "footer": {
                        "separator": true
                    }
                    },
                    "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                        "type": "text",
                        "text": "主管",
                        "weight": "bold",
                        "color": "#1DB446",
                        "size": "sm"
                        },
                        {
                        "type": "text",
                        "text": "已批准假單",
                        "weight": "bold",
                        "size": "xxl",
                        "margin": "md"
                        },
                        {
                        "type": "separator",
                        "margin": "xxl"
                        },
                        {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "xxl",
                        "spacing": "sm",
                        "contents": [
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                "type": "text",
                                "text": "開始日期",
                                "size": "sm",
                                "color": "#555555",
                                "flex": 0
                                },
                                {
                                "type": "text",
                                "text": leave.startDate,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            },
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                "type": "text",
                                "text": "結束日期",
                                "size": "sm",
                                "color": "#555555",
                                "flex": 0
                                },
                                {
                                "type": "text",
                                "text": leave.endDate,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            },
                            {
                            "type": "separator",
                            "margin": "xxl"
                            },
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "margin": "xxl",
                            "contents": [
                                {
                                "type": "text",
                                "text": "假別",
                                "size": "sm",
                                "color": "#555555"
                                },
                                {
                                "type": "text",
                                "text": leave.leaveType,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            },
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                "type": "text",
                                "text": "請假原因",
                                "size": "sm",
                                "color": "#555555"
                                },
                                {
                                "type": "text",
                                "text": leave.leaveReason,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            },
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                "type": "text",
                                "text": "代理人",
                                "size": "sm",
                                "color": "#555555"
                                },
                                {
                                "type": "text",
                                "text": substituteInfo.name,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            }
                        ]
                        },
                        {
                        "type": "separator",
                        "margin": "xxl"
                        },
                        {
                        "type": "box",
                        "layout": "horizontal",
                        "margin": "md",
                        "contents": [
                            {
                            "type": "text",
                            "text": "簽核狀態",
                            "size": "xs",
                            "color": "#555555",
                            "flex": 0
                            },
                            {
                            "type": "text",
                            "text": "同意(主管)",
                            "color": "#1DB446",
                            "size": "xs",
                            "align": "end"
                            }
                        ]
                        }
                    ]
                    }
                }
            };
            pushMessage(self.userId, [message_self]);
            return result;
        }
    } catch (error) {
        throw(error);
    }
};

export const approveLeaveSub_web = async (ubn, leaveId) => {
  try {
      const leave = await getLeave(ubn, leaveId);
      if (leave.status != "等待簽核") {
          /*        
          const messages = {
              "type": "text",
              "text": "此張假單已簽核"
          };
          pushMessage(userId, [messages]);
          //throw(ErrorWithCode('Leave has already been approved/rejected:' + leaveId));
          */
      } else {
          var updateData = {
              "status": "同意 (代理人)"
          }
          const result = await updateLeave(ubn, leaveId, updateData);
          
          const substituteInfo = JSON.parse(leave.substitute);
          const substitute = await getStaff(ubn, substituteInfo.email);
          const selfStaff = await getStaff(ubn, leave.email);
          const self = await getStaff(ubn, leave.email);
          const department = await getDepartment(ubn, substitute.department);
          const supervisor = await getStaff(ubn, department.supervisor);
          const message_self = {
                "type": "flex",
                "altText": "代理人已批准假單",
                "contents": {
                    "type": "bubble",
                    "styles": {
                    "footer": {
                        "separator": true
                    }
                    },
                    "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                        "type": "text",
                        "text": "代理人",
                        "weight": "bold",
                        "color": "#1DB446",
                        "size": "sm"
                        },
                        {
                        "type": "text",
                        "text": "已批准假單",
                        "weight": "bold",
                        "size": "xxl",
                        "margin": "md"
                        },
                        {
                        "type": "separator",
                        "margin": "xxl"
                        },
                        {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "xxl",
                        "spacing": "sm",
                        "contents": [
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                "type": "text",
                                "text": "開始日期",
                                "size": "sm",
                                "color": "#555555",
                                "flex": 0
                                },
                                {
                                "type": "text",
                                "text": leave.startDate,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            },
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                "type": "text",
                                "text": "結束日期",
                                "size": "sm",
                                "color": "#555555",
                                "flex": 0
                                },
                                {
                                "type": "text",
                                "text": leave.endDate,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            },
                            {
                            "type": "separator",
                            "margin": "xxl"
                            },
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "margin": "xxl",
                            "contents": [
                                {
                                "type": "text",
                                "text": "假別",
                                "size": "sm",
                                "color": "#555555"
                                },
                                {
                                "type": "text",
                                "text": leave.leaveType,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            },
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                "type": "text",
                                "text": "請假原因",
                                "size": "sm",
                                "color": "#555555"
                                },
                                {
                                "type": "text",
                                "text": leave.leaveReason,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            },
                            {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                "type": "text",
                                "text": "代理人",
                                "size": "sm",
                                "color": "#555555"
                                },
                                {
                                "type": "text",
                                "text": substituteInfo.name,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                                }
                            ]
                            }
                        ]
                        },
                        {
                        "type": "separator",
                        "margin": "xxl"
                        },
                        {
                        "type": "box",
                        "layout": "horizontal",
                        "margin": "md",
                        "contents": [
                            {
                            "type": "text",
                            "text": "簽核狀態",
                            "size": "xs",
                            "color": "#555555",
                            "flex": 0
                            },
                            {
                            "type": "text",
                            "text": "同意(代理人)",
                            "color": "#1DB446",
                            "size": "xs",
                            "align": "end"
                            }
                        ]
                        }
                    ]
                    }
                }
          };
          const message_super = {
            "type": "flex",
            "altText": "[主管] 是否批准假單？",
            "contents": {
              "type": "bubble",
              "styles": {},
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "主管",
                    "weight": "bold",
                    "color": "#1DB446",
                    "size": "sm"
                  },
                  {
                    "type": "text",
                    "text": "是否批准假單？",
                    "weight": "bold",
                    "size": "xxl",
                    "margin": "md"
                  },
                  {
                    "type": "separator",
                    "margin": "xxl"
                  },
                  {
                    "type": "box",
                    "layout": "vertical",
                    "margin": "xxl",
                    "spacing": "sm",
                    "contents": [
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                          {
                            "type": "text",
                            "text": "請假者",
                            "size": "sm",
                            "color": "#555555"
                          },
                          {
                            "type": "text",
                            "text": selfStaff.name,
                            "size": "sm",
                            "color": "#111111",
                            "align": "end"
                          }
                        ]
                      },
                      {
                        "type": "separator",
                        "margin": "xxl"
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "margin": "xxl",
                        "contents": [
                          {
                            "type": "text",
                            "text": "開始日期",
                            "size": "sm",
                            "color": "#555555"
                          },
                          {
                            "type": "text",
                            "text": leave.startDate,
                            "size": "sm",
                            "color": "#111111",
                            "align": "end"
                          }
                        ]
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                          {
                            "type": "text",
                            "text": "結束日期",
                            "size": "sm",
                            "color": "#555555",
                            "flex": 0
                          },
                          {
                            "type": "text",
                            "text": leave.endDate,
                            "size": "sm",
                            "color": "#111111",
                            "align": "end"
                          }
                        ]
                      },
                      {
                        "type": "separator",
                        "margin": "xxl"
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "margin": "xxl",
                        "contents": [
                          {
                            "type": "text",
                            "text": "假別",
                            "size": "sm",
                            "color": "#555555"
                          },
                          {
                            "type": "text",
                            "text": leave.leaveType,
                            "size": "sm",
                            "color": "#111111",
                            "align": "end"
                          }
                        ]
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                          {
                            "type": "text",
                            "text": "請假原因",
                            "size": "sm",
                            "color": "#555555"
                          },
                          {
                            "type": "text",
                            "text": leave.leaveReason,
                            "size": "sm",
                            "color": "#111111",
                            "align": "end"
                          }
                        ]
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                          {
                            "type": "text",
                            "text": "代理人",
                            "size": "sm",
                            "color": "#555555"
                          },
                          {
                            "type": "text",
                            "text": substituteInfo.name,
                            "size": "sm",
                            "color": "#111111",
                            "align": "end"
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "type": "separator",
                    "margin": "xxl"
                  },
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "margin": "md",
                    "contents": [
                      {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "md",
                        "contents": [
                          {
                            "type": "button",
                            "style": "secondary",
                            "height": "sm",
                            "action": {
                              "type": "uri",
                              "label": "拒絕",
                              "uri": `line://app/1596565799-A57K2l04?ubn=${ubn}&leaveId=${leave.id}`
                            }
                          }
                        ]
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "md",
                        "contents": [
                          {
                            "type": "button",
                            "style": "secondary",
                            "height": "sm",
                            "action": {
                              "type": "postback",
                              "label": "批准",
                              "data": `action=同意&role=主管&ubn=${ubn}&leaveId=${leave.id}`,
                              "text": "批准"
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          };
          pushMessage(self.userId, [message_self]);
          pushMessage(supervisor.userId, [message_super]);
          return result;
      }
  } catch (error) {
      throw(error);
  }
};

export const approveLeaveSuper_web = async (ubn, leaveId) => {
  try {
      const leave = await getLeave(ubn, leaveId);
      if (leave.status != "同意 (代理人)") {
          /*        
          const messages = {
                "type": "text",
                "text": "此張假單已簽核"
            };
            pushMessage(userId, [messages]);
            //throw(ErrorWithCode('Leave has already been approved/rejected:' + leaveId));
          */
      } else {
          var updateData = {
              "status": "同意 (主管)"
          }
          const result = await updateLeave(ubn, leaveId, updateData);
          const self = await getStaff(ubn, leave.email);
          const substituteInfo = JSON.parse(leave.substitute);
          const message_self = {
              "type": "flex",
              "altText": "主管已批准假單",
              "contents": {
                  "type": "bubble",
                  "styles": {
                  "footer": {
                      "separator": true
                  }
                  },
                  "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                      {
                      "type": "text",
                      "text": "主管",
                      "weight": "bold",
                      "color": "#1DB446",
                      "size": "sm"
                      },
                      {
                      "type": "text",
                      "text": "已批准假單",
                      "weight": "bold",
                      "size": "xxl",
                      "margin": "md"
                      },
                      {
                      "type": "separator",
                      "margin": "xxl"
                      },
                      {
                      "type": "box",
                      "layout": "vertical",
                      "margin": "xxl",
                      "spacing": "sm",
                      "contents": [
                          {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [
                              {
                              "type": "text",
                              "text": "開始日期",
                              "size": "sm",
                              "color": "#555555",
                              "flex": 0
                              },
                              {
                              "type": "text",
                              "text": leave.startDate,
                              "size": "sm",
                              "color": "#111111",
                              "align": "end"
                              }
                          ]
                          },
                          {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [
                              {
                              "type": "text",
                              "text": "結束日期",
                              "size": "sm",
                              "color": "#555555",
                              "flex": 0
                              },
                              {
                              "type": "text",
                              "text": leave.endDate,
                              "size": "sm",
                              "color": "#111111",
                              "align": "end"
                              }
                          ]
                          },
                          {
                          "type": "separator",
                          "margin": "xxl"
                          },
                          {
                          "type": "box",
                          "layout": "horizontal",
                          "margin": "xxl",
                          "contents": [
                              {
                              "type": "text",
                              "text": "假別",
                              "size": "sm",
                              "color": "#555555"
                              },
                              {
                              "type": "text",
                              "text": leave.leaveType,
                              "size": "sm",
                              "color": "#111111",
                              "align": "end"
                              }
                          ]
                          },
                          {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [
                              {
                              "type": "text",
                              "text": "請假原因",
                              "size": "sm",
                              "color": "#555555"
                              },
                              {
                              "type": "text",
                              "text": leave.leaveReason,
                              "size": "sm",
                              "color": "#111111",
                              "align": "end"
                              }
                          ]
                          },
                          {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [
                              {
                              "type": "text",
                              "text": "代理人",
                              "size": "sm",
                              "color": "#555555"
                              },
                              {
                              "type": "text",
                              "text": substituteInfo.name,
                              "size": "sm",
                              "color": "#111111",
                              "align": "end"
                              }
                          ]
                          }
                      ]
                      },
                      {
                      "type": "separator",
                      "margin": "xxl"
                      },
                      {
                      "type": "box",
                      "layout": "horizontal",
                      "margin": "md",
                      "contents": [
                          {
                          "type": "text",
                          "text": "簽核狀態",
                          "size": "xs",
                          "color": "#555555",
                          "flex": 0
                          },
                          {
                          "type": "text",
                          "text": "同意(主管)",
                          "color": "#1DB446",
                          "size": "xs",
                          "align": "end"
                          }
                      ]
                      }
                  ]
                  }
              }
          };
          pushMessage(self.userId, [message_self]);
          return result;
      }
  } catch (error) {
      throw(error);
  }
};