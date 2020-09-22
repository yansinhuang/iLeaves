import {
    create,
    update,
    search,
    fetch
} from '../db/leave';
import {
    pushMessage
} from '../message/lineUtils'
import {
    getStaff
} from '../staff/staff'
import {
    getDepartment
} from '../department/department'
import {
    partialUpdateObject
} from '../utils/partialUpdate'
import {
    ErrorWithCode
} from '../utils/error';
import Config from '../config';

export const createLeave = async (ubn, leave) => {
    try {
        const result = await create(ubn, leave);
        return result;
    } catch(err) {
        throw(err)
    }
}

export const getLeave = async (ubn, id) => {
    try {
        let data = await fetch(ubn, id);
        if (!data) throw(ErrorWithCode('Leave is not created:' + id));
        return data;
        
    } catch(err) {
        throw(err);
    }
}

export const getLeaves = async (ubn, query, value, page = 0, size = 100) => {
    try {
        let result = await search(ubn, query, value, page, size);
        //add name
        for (var i = 0; i < result.list.length; i++) {
          var staff = await getStaff(ubn, result.list[i].email);
          result.list[i].name = staff.name;
        }
        return result;
    } catch(err) {
        throw(err)
    }
}

export const sendMessages = async (ubn, userId, leave) => {
    try {
        const substituteInfo = JSON.parse(leave.substitute);
        const substituteStaff = await getStaff(ubn, substituteInfo.email);
        const selfStaff = await getStaff(ubn, leave.email);
        //const departmentInfo = await getDepartment(ubn, substituteStaff.department);
        //const supervisorStaff = await getStaff(ubn, departmentInfo.supervisor);
        const text = `開始日期：${leave.startDate}\n結束日期：${leave.endDate}\n假別：${leave.leaveType}\n請假原因：${leave.leaveReason}\n代理人：${substituteInfo.name}`;
        const message_self = {
            "type": "flex",
            "altText": "假單新增成功",
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
                      "text": "假單新增成功",
                      "weight": "bold",
                      "color": "#1DB446",
                      "size": "sm"
                    },
                    {
                      "type": "text",
                      "text": "假單",
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
                          "color": "#aaaaaa",
                          "flex": 0
                        },
                        {
                          "type": "text",
                          "text": "待簽核",
                          "color": "#aaaaaa",
                          "size": "xs",
                          "align": "end"
                        }
                      ]
                    }
                  ]
                }
              }
        }
        const message_sub = {
          "type": "flex",
          "altText": "[代理人] 是否批准假單？",
          "contents": {
            "type": "bubble",
            "styles": {},
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
                            "uri": `line://app/${Config.liff.reject_sub}?ubn=${ubn}&leaveId=${leave.id}`
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
                            "data": `action=同意&role=代理人&ubn=${ubn}&leaveId=${leave.id}`,
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
        
        pushMessage(userId, [message_self]);
        pushMessage(substituteStaff.userId, [message_sub]);
        //pushMessage(supervisorStaff.userId, [message_super]);
    } catch(err) {
        throw(err)
    }
}

export const updateLeave = async (ubn, id, updateData) => {
    try {
        let data = await fetch(ubn, id);
        if (!data) throw(ErrorWithCode('Leave is not created:' + id));
        
        const supportFields = [
            'status',
            'rejectReason',
            'supervisor'
        ];
        data = partialUpdateObject(data, updateData, supportFields);
        return await update(ubn, data);
    } catch(err) {
        throw(err);
    }
}