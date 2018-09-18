let notificationMessage = {
    "text": "Time to add your hours for today",
    "attachments": [
        {
            "text": "Didn't work 8 hours? Click More Info.",
            "fallback": "Unable to Update Daily Timesheet. Please go directly to BambooHR",
            "callback_id": "bambot_daily_hours",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "hours",
                    "text": "8 Great Hours",
                    "type": "button",
                    "value": "default",
                    "style": "primary"
                },
                {
                    "name": "hours",
                    "text": "More Info",
                    "type": "button",
                    "value": "custom"
                }
            ]
        }
    ]
}
let dialog = {
    "dialog": {
        "title": "Add Work Hours",
        "submit_label": "Submit",
        "state": "Limo",
        "elements": [
            {
                "type": "text",
                "label": "Hours Worked",
                "name": "hours",
                "placeholder": 8,
                "subtype": "number"
            },
            {
                "type": "textarea",
                "label": "Description of Work",
                "name": "description",
                "optional": "true",
                "placeholder": "What kinda work did you do today rockstar?"
            }
        ]
    }
}

export { notificationMessage };
export { dialog };