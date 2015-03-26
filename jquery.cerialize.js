    (function ($) {

         $.fn.cerialize = function (options) {
             return $.param(this.cerializeArray(options));
         };

         $.fn.cerializeArray = function (options) {
             var o = $.extend({}, options || {});

//            var rselectTextarea = /select|textarea/i;
//            var rinput = /text|hidden|password|search/i;

            return $.makeArray(this.find("[name]").andSelf().filter("input[type=text], input[type=number], input[type=hidden], input[type=password], input[type=checkbox], input[type=email], input[type=file], input[type=radio]:checked, select, textarea").map(function (i, elem) {
                var val = $(this).val();

                if (val === null)
                {
                    return null;
                }

                if ($.isArray(val))
                {
                    return $.map(val, function (val, i) {
                        return { name: elem.name, value: val };
                    });
                }
                else
                {
                    return {name: elem.name, value: ((this.type === 'checkbox') ? (this.checked ? val : null) : val)};
                };
            }));
         };

        $.fn.cerializeObject = function(){

            var self = this,
                json = {},
                push_counters = {},
                patterns = {
                    "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
                    "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
                    "push":     /^$/,
                    "fixed":    /^\d+$/,
                    "named":    /^[a-zA-Z0-9_]+$/
                };


            this.build = function(base, key, value){
                base[key] = value;
                return base;
            };

            this.push_counter = function(key){
                if(push_counters[key] === undefined){
                    push_counters[key] = 0;
                }
                return push_counters[key]++;
            };

            this.merge = function (obj1, obj2) {
                for (var p in obj2)
                {
                    try
                    {
                        // Property in destination object set; update its value.
                        if ( obj2[p].constructor==Object )
                        {
                            obj1[p] = self.merge(obj1[p], obj2[p]);
                        }
                        else
                        {
                            if (obj1[p] === undefined)
                            {
                                obj1[p] = obj2[p];
                            }
                            else
                            {
                                obj1[p] = [obj1[p], obj2[p]];
                            }
                        }

                    }
                    catch (e)
                    {
                        // Property in destination object not set; create it and set its value.
                        obj1[p] = obj2[p];
                    }
                }

                return obj1;
            };

            $.each($(this).cerializeArray(), function(){

                // skip invalid keys
                if(!patterns.validate.test(this.name)){
                    return;
                }

                var k,
                    keys = this.name.match(patterns.key),
                    merge = this.value,
                    reverse_key = this.name;

                while((k = keys.pop()) !== undefined){

                    // adjust reverse_key
                    reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

                    // push
                    if(k.match(patterns.push)){
                        merge = self.build([], self.push_counter(reverse_key), merge);
                    }

                    // fixed
                    else if(k.match(patterns.fixed)){
                        merge = self.build([], k, merge);
                    }

                    // named
                    else if(k.match(patterns.named)){
                        merge = self.build({}, k, merge);
                    }
                }

                json = self.merge(json, merge);
            });

            return json;
        };
    })(jQuery);
