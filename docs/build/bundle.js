
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value' || descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* home/filip/Programming/OpenSource/svelte/svelte-fullpage/src/Indicator/Dot.svelte generated by Svelte v3.20.1 */

    const file = "home/filip/Programming/OpenSource/svelte/svelte-fullpage/src/Indicator/Dot.svelte";

    // (13:4) {#if names}
    function create_if_block(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*name*/ ctx[2]);
    			attr_dev(p, "class", "svelte-fp-slide-name svelte-tlycps");
    			add_location(p, file, 13, 8, 266);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 4) set_data_dev(t, /*name*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(13:4) {#if names}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let li;
    	let t;
    	let button;
    	let button_class_value;
    	let dispose;
    	let if_block = /*names*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (if_block) if_block.c();
    			t = space();
    			button = element("button");

    			attr_dev(button, "class", button_class_value = "svelte-fp-indicator-list-item-btn " + (/*activeSection*/ ctx[0] === /*index*/ ctx[1]
    			? "svelte-fp-active"
    			: "") + " svelte-tlycps");

    			add_location(button, file, 17, 4, 345);
    			attr_dev(li, "class", "svelte-fp-indicator-list-item svelte-tlycps");
    			add_location(li, file, 11, 0, 199);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, li, anchor);
    			if (if_block) if_block.m(li, null);
    			append_dev(li, t);
    			append_dev(li, button);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*goto*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*names*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(li, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*activeSection, index*/ 3 && button_class_value !== (button_class_value = "svelte-fp-indicator-list-item-btn " + (/*activeSection*/ ctx[0] === /*index*/ ctx[1]
    			? "svelte-fp-active"
    			: "") + " svelte-tlycps")) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block) if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { activeSection = 0 } = $$props;
    	let { index = 0 } = $$props;
    	let { name = "" } = $$props;
    	let { names = false } = $$props;

    	const goto = () => {
    		$$invalidate(0, activeSection = index);
    	};

    	const writable_props = ["activeSection", "index", "name", "names"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dot> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Dot", $$slots, []);

    	$$self.$set = $$props => {
    		if ("activeSection" in $$props) $$invalidate(0, activeSection = $$props.activeSection);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("names" in $$props) $$invalidate(3, names = $$props.names);
    	};

    	$$self.$capture_state = () => ({ activeSection, index, name, names, goto });

    	$$self.$inject_state = $$props => {
    		if ("activeSection" in $$props) $$invalidate(0, activeSection = $$props.activeSection);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("names" in $$props) $$invalidate(3, names = $$props.names);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeSection, index, name, names, goto];
    }

    class Dot extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			activeSection: 0,
    			index: 1,
    			name: 2,
    			names: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dot",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get activeSection() {
    		throw new Error("<Dot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSection(value) {
    		throw new Error("<Dot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Dot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Dot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Dot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Dot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get names() {
    		throw new Error("<Dot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set names(value) {
    		throw new Error("<Dot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* home/filip/Programming/OpenSource/svelte/svelte-fullpage/src/Indicator/index.svelte generated by Svelte v3.20.1 */
    const file$1 = "home/filip/Programming/OpenSource/svelte/svelte-fullpage/src/Indicator/index.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (10:8) {#each sections as page,index}
    function create_each_block(ctx) {
    	let updating_activeSection;
    	let current;

    	function dot_activeSection_binding(value) {
    		/*dot_activeSection_binding*/ ctx[2].call(null, value);
    	}

    	let dot_props = {
    		index: /*index*/ ctx[5],
    		name: /*page*/ ctx[3]
    	};

    	if (/*activeSection*/ ctx[0] !== void 0) {
    		dot_props.activeSection = /*activeSection*/ ctx[0];
    	}

    	const dot = new Dot({ props: dot_props, $$inline: true });
    	binding_callbacks.push(() => bind(dot, "activeSection", dot_activeSection_binding));

    	const block = {
    		c: function create() {
    			create_component(dot.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dot, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dot_changes = {};
    			if (dirty & /*sections*/ 2) dot_changes.name = /*page*/ ctx[3];

    			if (!updating_activeSection && dirty & /*activeSection*/ 1) {
    				updating_activeSection = true;
    				dot_changes.activeSection = /*activeSection*/ ctx[0];
    				add_flush_callback(() => updating_activeSection = false);
    			}

    			dot.$set(dot_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dot.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dot.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dot, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(10:8) {#each sections as page,index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let ul;
    	let current;
    	let each_value = /*sections*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-fp-indicator-list svelte-dh6fo0");
    			add_location(ul, file$1, 8, 4, 158);
    			attr_dev(div, "class", "svelte-fp-indicator svelte-dh6fo0");
    			add_location(div, file$1, 7, 0, 120);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*sections, activeSection*/ 3) {
    				each_value = /*sections*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { sections = [] } = $$props;
    	let { activeSection = 0 } = $$props;
    	const writable_props = ["sections", "activeSection"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Indicator> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Indicator", $$slots, []);

    	function dot_activeSection_binding(value) {
    		activeSection = value;
    		$$invalidate(0, activeSection);
    	}

    	$$self.$set = $$props => {
    		if ("sections" in $$props) $$invalidate(1, sections = $$props.sections);
    		if ("activeSection" in $$props) $$invalidate(0, activeSection = $$props.activeSection);
    	};

    	$$self.$capture_state = () => ({ Dot, sections, activeSection });

    	$$self.$inject_state = $$props => {
    		if ("sections" in $$props) $$invalidate(1, sections = $$props.sections);
    		if ("activeSection" in $$props) $$invalidate(0, activeSection = $$props.activeSection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeSection, sections, dot_activeSection_binding];
    }

    class Indicator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { sections: 1, activeSection: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Indicator",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get sections() {
    		throw new Error("<Indicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sections(value) {
    		throw new Error("<Indicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSection() {
    		throw new Error("<Indicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSection(value) {
    		throw new Error("<Indicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* home/filip/Programming/OpenSource/svelte/svelte-fullpage/src/Fullpage.svelte generated by Svelte v3.20.1 */
    const file$2 = "home/filip/Programming/OpenSource/svelte/svelte-fullpage/src/Fullpage.svelte";

    function create_fragment$2(ctx) {
    	let t0;
    	let div2;
    	let div1;
    	let div0;
    	let t1;
    	let updating_activeSection;
    	let updating_sections;
    	let div2_class_value;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[30].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[29], null);

    	function indicator_activeSection_binding(value) {
    		/*indicator_activeSection_binding*/ ctx[33].call(null, value);
    	}

    	function indicator_sections_binding(value) {
    		/*indicator_sections_binding*/ ctx[34].call(null, value);
    	}

    	let indicator_props = {};

    	if (/*activeSection*/ ctx[0] !== void 0) {
    		indicator_props.activeSection = /*activeSection*/ ctx[0];
    	}

    	if (/*sections*/ ctx[2] !== void 0) {
    		indicator_props.sections = /*sections*/ ctx[2];
    	}

    	const indicator = new Indicator({ props: indicator_props, $$inline: true });
    	binding_callbacks.push(() => bind(indicator, "activeSection", indicator_activeSection_binding));
    	binding_callbacks.push(() => bind(indicator, "sections", indicator_sections_binding));

    	const block = {
    		c: function create() {
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			create_component(indicator.$$.fragment);
    			attr_dev(div0, "class", "svelte-fp-container svelte-ng9shq");
    			add_location(div0, file$2, 163, 8, 5754);
    			attr_dev(div1, "class", "svelte-fp-container svelte-ng9shq");
    			add_location(div1, file$2, 162, 4, 5712);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*classes*/ ctx[4]) + " svelte-ng9shq"));
    			attr_dev(div2, "style", /*style*/ ctx[1]);
    			add_location(div2, file$2, 160, 0, 5398);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[32](div0);
    			append_dev(div1, t1);
    			mount_component(indicator, div1, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(window, "keydown", /*keydown_handler*/ ctx[31], false, false, false),
    				listen_dev(div2, "wheel", /*wheel_handler*/ ctx[35], false, false, false),
    				listen_dev(div2, "touchstart", /*touchstart_handler*/ ctx[36], false, false, false),
    				listen_dev(div2, "touchmove", /*touchmove_handler*/ ctx[37], false, false, false),
    				listen_dev(div2, "drag", drag_handler, false, false, false),
    				listen_dev(div2, "mousedown", /*mousedown_handler*/ ctx[38], false, false, false),
    				listen_dev(div2, "mouseup", /*mouseup_handler*/ ctx[39], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 536870912) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[29], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[29], dirty, null));
    				}
    			}

    			const indicator_changes = {};

    			if (!updating_activeSection && dirty[0] & /*activeSection*/ 1) {
    				updating_activeSection = true;
    				indicator_changes.activeSection = /*activeSection*/ ctx[0];
    				add_flush_callback(() => updating_activeSection = false);
    			}

    			if (!updating_sections && dirty[0] & /*sections*/ 4) {
    				updating_sections = true;
    				indicator_changes.sections = /*sections*/ ctx[2];
    				add_flush_callback(() => updating_sections = false);
    			}

    			indicator.$set(indicator_changes);

    			if (!current || dirty[0] & /*style*/ 2) {
    				attr_dev(div2, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(indicator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(indicator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[32](null);
    			destroy_component(indicator);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const drag_handler = () => {
    	return false;
    };

    function instance$2($$self, $$props, $$invalidate) {
    	let { class: defaultClasses = "" } = $$props;
    	let { style = "" } = $$props;
    	let { activeSection = 0 } = $$props;
    	const activeSectionStore = writable(activeSection);
    	let sectionCount = 0;
    	let { sectionTitles = false } = $$props;
    	let sections = [];
    	let { transitionDuration = 500 } = $$props;
    	let { arrows = false } = $$props;
    	let { drag = false } = $$props;
    	let { dragThreshold = 100 } = $$props;
    	let { touchThreshold = 75 } = $$props;
    	let { pullDownToRefresh = false } = $$props;
    	let fullpageContent;
    	let dragStartPosition;
    	let touchStartPosition;

    	//extending exported classes with wrapper class
    	let classes = `${defaultClasses} svelte-fp-wrapper`;

    	let recentScroll = 0;

    	//setting section visible
    	let active = true;

    	// Passing data about section visibility to all sections
    	setContext("section", {
    		activeSectionStore,
    		getId: () => {
    			$$invalidate(19, sectionCount++, sectionCount);
    			return sectionCount - 1;
    		}
    	});

    	//function that handles scroll and sets scroll cooldown based on animation duration
    	const handleScroll = event => {
    		//getting direction of scroll, if negative, scroll up, if positive, scroll down
    		let deltaY = event.deltaY;

    		let timer = new Date().getTime();

    		//if cooldown time is up, fullpage is scrollable again
    		if (transitionDuration < timer - recentScroll) {
    			recentScroll = timer;

    			if (deltaY < 0) {
    				scrollUp();
    			} else if (deltaY > 0) {
    				scrollDown();
    			}
    		}
    	};

    	//function that toggles visibility of active section
    	const toggleActive = () => {
    		active = !active;
    	};

    	//function that makes scroll up effect
    	const scrollUp = async () => {
    		// TODO: somehow fix animation
    		if (activeSection > 0) {
    			$$invalidate(0, activeSection--, activeSection);
    		}
    	};

    	//function that makes scroll down effect
    	const scrollDown = async () => {
    		// TODO: somehow fix animation
    		if (activeSection < sectionCount) {
    			$$invalidate(0, activeSection++, activeSection);
    		}
    	};

    	//function that handles arrow event
    	const handleKey = event => {
    		if (arrows) {
    			switch (event.key) {
    				case "ArrowDown":
    					scrollDown();
    					break;
    				case "ArrowUp":
    					scrollUp();
    					break;
    			}
    		}
    	};

    	//function that handles drag start event
    	const handleDragStart = event => {
    		if (drag) {
    			dragStartPosition = event.screenY;
    		}
    	}; //event.preventDefault();

    	//function that handles drag end event
    	const handleDragEnd = event => {
    		if (drag) {
    			const dragEndPosition = event.screenY;

    			//console.log(`Start:${dragStartPosition}, End:${dragEndPosition}, vertical difference:${dragStartPosition-dragEndPosition}`);
    			if (dragStartPosition - dragEndPosition > dragThreshold) {
    				scrollDown();
    			} else if (dragStartPosition - dragEndPosition < -dragThreshold) {
    				scrollUp();
    			}
    		}
    	}; //event.preventDefault();

    	//function that handles touch event
    	const handleTouchStart = event => {
    		//event.preventDefault();
    		touchStartPosition = event.touches[0].screenY;
    	};

    	const handleTouchEnd = event => {
    		//event.preventDefault();
    		let timer = new Date().getTime();

    		const touchEndPosition = event.touches[0].screenY;

    		if (transitionDuration < timer - recentScroll) {
    			if (touchStartPosition - touchEndPosition > touchThreshold) {
    				scrollDown();
    				recentScroll = timer;
    			} else if (touchStartPosition - touchEndPosition < -touchThreshold) {
    				scrollUp();
    				recentScroll = timer;
    			}
    		}
    	};

    	console.log($$props.$$slots.default[0]);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Fullpage", $$slots, ['default']);
    	const keydown_handler = event => handleKey(event);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, fullpageContent = $$value);
    		});
    	}

    	function indicator_activeSection_binding(value) {
    		activeSection = value;
    		$$invalidate(0, activeSection);
    	}

    	function indicator_sections_binding(value) {
    		sections = value;
    		((($$invalidate(2, sections), $$invalidate(12, sectionTitles)), $$invalidate(3, fullpageContent)), $$invalidate(19, sectionCount));
    	}

    	const wheel_handler = event => handleScroll(event);
    	const touchstart_handler = event => handleTouchStart(event);
    	const touchmove_handler = event => handleTouchEnd(event);
    	const mousedown_handler = event => handleDragStart(event);
    	const mouseup_handler = event => handleDragEnd(event);

    	$$self.$set = $$new_props => {
    		$$invalidate(28, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(11, defaultClasses = $$new_props.class);
    		if ("style" in $$new_props) $$invalidate(1, style = $$new_props.style);
    		if ("activeSection" in $$new_props) $$invalidate(0, activeSection = $$new_props.activeSection);
    		if ("sectionTitles" in $$new_props) $$invalidate(12, sectionTitles = $$new_props.sectionTitles);
    		if ("transitionDuration" in $$new_props) $$invalidate(13, transitionDuration = $$new_props.transitionDuration);
    		if ("arrows" in $$new_props) $$invalidate(14, arrows = $$new_props.arrows);
    		if ("drag" in $$new_props) $$invalidate(15, drag = $$new_props.drag);
    		if ("dragThreshold" in $$new_props) $$invalidate(16, dragThreshold = $$new_props.dragThreshold);
    		if ("touchThreshold" in $$new_props) $$invalidate(17, touchThreshold = $$new_props.touchThreshold);
    		if ("pullDownToRefresh" in $$new_props) $$invalidate(18, pullDownToRefresh = $$new_props.pullDownToRefresh);
    		if ("$$scope" in $$new_props) $$invalidate(29, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Indicator,
    		onMount,
    		setContext,
    		writable,
    		defaultClasses,
    		style,
    		activeSection,
    		activeSectionStore,
    		sectionCount,
    		sectionTitles,
    		sections,
    		transitionDuration,
    		arrows,
    		drag,
    		dragThreshold,
    		touchThreshold,
    		pullDownToRefresh,
    		fullpageContent,
    		dragStartPosition,
    		touchStartPosition,
    		classes,
    		recentScroll,
    		active,
    		handleScroll,
    		toggleActive,
    		scrollUp,
    		scrollDown,
    		handleKey,
    		handleDragStart,
    		handleDragEnd,
    		handleTouchStart,
    		handleTouchEnd
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(28, $$props = assign(assign({}, $$props), $$new_props));
    		if ("defaultClasses" in $$props) $$invalidate(11, defaultClasses = $$new_props.defaultClasses);
    		if ("style" in $$props) $$invalidate(1, style = $$new_props.style);
    		if ("activeSection" in $$props) $$invalidate(0, activeSection = $$new_props.activeSection);
    		if ("sectionCount" in $$props) $$invalidate(19, sectionCount = $$new_props.sectionCount);
    		if ("sectionTitles" in $$props) $$invalidate(12, sectionTitles = $$new_props.sectionTitles);
    		if ("sections" in $$props) $$invalidate(2, sections = $$new_props.sections);
    		if ("transitionDuration" in $$props) $$invalidate(13, transitionDuration = $$new_props.transitionDuration);
    		if ("arrows" in $$props) $$invalidate(14, arrows = $$new_props.arrows);
    		if ("drag" in $$props) $$invalidate(15, drag = $$new_props.drag);
    		if ("dragThreshold" in $$props) $$invalidate(16, dragThreshold = $$new_props.dragThreshold);
    		if ("touchThreshold" in $$props) $$invalidate(17, touchThreshold = $$new_props.touchThreshold);
    		if ("pullDownToRefresh" in $$props) $$invalidate(18, pullDownToRefresh = $$new_props.pullDownToRefresh);
    		if ("fullpageContent" in $$props) $$invalidate(3, fullpageContent = $$new_props.fullpageContent);
    		if ("dragStartPosition" in $$props) dragStartPosition = $$new_props.dragStartPosition;
    		if ("touchStartPosition" in $$props) touchStartPosition = $$new_props.touchStartPosition;
    		if ("classes" in $$props) $$invalidate(4, classes = $$new_props.classes);
    		if ("recentScroll" in $$props) recentScroll = $$new_props.recentScroll;
    		if ("active" in $$props) active = $$new_props.active;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*activeSection*/ 1) {
    			// Everytime active session updates, also this store gets new value and then all sections that subscribe
    			 activeSectionStore.set(activeSection);
    		}

    		if ($$self.$$.dirty[0] & /*sectionTitles*/ 4096) {
    			 if (sectionTitles) $$invalidate(2, sections = sectionTitles);
    		}

    		if ($$self.$$.dirty[0] & /*fullpageContent, sectionTitles, sectionCount, sections*/ 528396) {
    			 if (fullpageContent && !sectionTitles) {
    				console.log(fullpageContent.children.length);

    				for (let i = 0; sectionCount > i; i++) {
    					$$invalidate(2, sections = [...sections, `Section ${i + 1}`]);
    				}

    				console.log(sections);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		activeSection,
    		style,
    		sections,
    		fullpageContent,
    		classes,
    		handleScroll,
    		handleKey,
    		handleDragStart,
    		handleDragEnd,
    		handleTouchStart,
    		handleTouchEnd,
    		defaultClasses,
    		sectionTitles,
    		transitionDuration,
    		arrows,
    		drag,
    		dragThreshold,
    		touchThreshold,
    		pullDownToRefresh,
    		sectionCount,
    		dragStartPosition,
    		touchStartPosition,
    		recentScroll,
    		active,
    		activeSectionStore,
    		toggleActive,
    		scrollUp,
    		scrollDown,
    		$$props,
    		$$scope,
    		$$slots,
    		keydown_handler,
    		div0_binding,
    		indicator_activeSection_binding,
    		indicator_sections_binding,
    		wheel_handler,
    		touchstart_handler,
    		touchmove_handler,
    		mousedown_handler,
    		mouseup_handler
    	];
    }

    class Fullpage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				class: 11,
    				style: 1,
    				activeSection: 0,
    				sectionTitles: 12,
    				transitionDuration: 13,
    				arrows: 14,
    				drag: 15,
    				dragThreshold: 16,
    				touchThreshold: 17,
    				pullDownToRefresh: 18
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fullpage",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get class() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSection() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSection(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sectionTitles() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sectionTitles(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionDuration() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionDuration(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get arrows() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arrows(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get drag() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set drag(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dragThreshold() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dragThreshold(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get touchThreshold() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set touchThreshold(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pullDownToRefresh() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pullDownToRefresh(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => `overflow: hidden;` +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* home/filip/Programming/OpenSource/svelte/svelte-fullpage/src/FullpageSection.svelte generated by Svelte v3.20.1 */
    const file$3 = "home/filip/Programming/OpenSource/svelte/svelte-fullpage/src/FullpageSection.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	child_ctx[40] = i;
    	return child_ctx;
    }

    // (141:0) {#if sectionId === $activeSectionStore}
    function create_if_block$1(ctx) {
    	let section;
    	let div;
    	let t;
    	let section_class_value;
    	let section_transition;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[31].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[30], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);
    	let if_block = /*slides*/ ctx[1][0] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "svelte-fp-container svelte-fp-flexbox-expand svelte-l4liqa");
    			toggle_class(div, "svelte-fp-flexbox-center", /*center*/ ctx[2]);
    			add_location(div, file$3, 144, 8, 4384);
    			attr_dev(section, "class", section_class_value = "" + (null_to_empty(/*classes*/ ctx[6]) + " svelte-l4liqa"));
    			attr_dev(section, "style", /*style*/ ctx[0]);
    			add_location(section, file$3, 141, 4, 4058);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div, null);
    			}

    			append_dev(section, t);
    			if (if_block) if_block.m(section, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(section, "selectstart", /*handleSelect*/ ctx[9], false, false, false),
    				listen_dev(section, "mousedown", /*mousedown_handler*/ ctx[34], false, false, false),
    				listen_dev(section, "mouseup", /*mouseup_handler*/ ctx[35], false, false, false),
    				listen_dev(section, "touchstart", /*touchstart_handler*/ ctx[36], false, false, false),
    				listen_dev(section, "touchmove", /*touchmove_handler*/ ctx[37], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 1073741824) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[30], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[30], dirty, null));
    				}
    			}

    			if (dirty[0] & /*center*/ 4) {
    				toggle_class(div, "svelte-fp-flexbox-center", /*center*/ ctx[2]);
    			}

    			if (/*slides*/ ctx[1][0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(section, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty[0] & /*classes*/ 64 && section_class_value !== (section_class_value = "" + (null_to_empty(/*classes*/ ctx[6]) + " svelte-l4liqa"))) {
    				attr_dev(section, "class", section_class_value);
    			}

    			if (!current || dirty[0] & /*style*/ 1) {
    				attr_dev(section, "style", /*style*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, slide, /*transition*/ ctx[3], true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			if (!section_transition) section_transition = create_bidirectional_transition(section, slide, /*transition*/ ctx[3], false);
    			section_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			if (if_block) if_block.d();
    			if (detaching && section_transition) section_transition.end();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(141:0) {#if sectionId === $activeSectionStore}",
    		ctx
    	});

    	return block;
    }

    // (146:18)              
    function fallback_block(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(146:18)              ",
    		ctx
    	});

    	return block;
    }

    // (149:8) {#if slides[0]}
    function create_if_block_1(ctx) {
    	let div;
    	let ul;
    	let each_value = /*slides*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-fp-indicator-list-horizontal svelte-l4liqa");
    			add_location(ul, file$3, 150, 16, 4634);
    			attr_dev(div, "class", "svelte-fp-indicator-horizontal svelte-l4liqa");
    			add_location(div, file$3, 149, 12, 4573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*activeSlideIndicator, toSlide, slides*/ 1058) {
    				each_value = /*slides*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(149:8) {#if slides[0]}",
    		ctx
    	});

    	return block;
    }

    // (152:20) {#each slides as page,index}
    function create_each_block$1(ctx) {
    	let li;
    	let button;
    	let button_class_value;
    	let t;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[33](/*index*/ ctx[40], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			t = space();

    			attr_dev(button, "class", button_class_value = "svelte-fp-indicator-list-item-btn " + (/*activeSlideIndicator*/ ctx[5] === /*index*/ ctx[40]
    			? "svelte-fp-active"
    			: "") + " svelte-l4liqa");

    			add_location(button, file$3, 153, 28, 4827);
    			attr_dev(li, "class", "svelte-fp-indicator-list-item svelte-l4liqa");
    			add_location(li, file$3, 152, 24, 4756);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(li, t);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*activeSlideIndicator*/ 32 && button_class_value !== (button_class_value = "svelte-fp-indicator-list-item-btn " + (/*activeSlideIndicator*/ ctx[5] === /*index*/ ctx[40]
    			? "svelte-fp-active"
    			: "") + " svelte-l4liqa")) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(152:20) {#each slides as page,index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let dispose;
    	let if_block = /*sectionId*/ ctx[4] === /*$activeSectionStore*/ ctx[7] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(window, "keydown", /*keydown_handler*/ ctx[32], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (/*sectionId*/ ctx[4] === /*$activeSectionStore*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $activeSectionStore;
    	let { class: defaultClasses = "" } = $$props;
    	let { style = "" } = $$props;
    	let sectionId;
    	const { getId, activeSectionStore } = getContext("section");
    	validate_store(activeSectionStore, "activeSectionStore");
    	component_subscribe($$self, activeSectionStore, value => $$invalidate(7, $activeSectionStore = value));
    	let { slides = [] } = $$props;
    	let { activeSlide = false } = $$props;
    	let { center = false } = $$props;
    	let { arrows = false } = $$props;
    	let { select = false } = $$props;
    	let { transitionDuration = 500 } = $$props;
    	let { dragThreshold = 100 } = $$props;
    	let { touchThreshold = 75 } = $$props;
    	let { transition = { duration: transitionDuration } } = $$props;
    	sectionId = parseInt(sectionId);
    	let activeSlideIndicator = activeSlide;
    	let dragStartPosition;
    	let touchStartPosition;
    	let recentSlide = 0;
    	let classes = `${defaultClasses} svelte-fp-section svelte-fp-flexbox-center`;

    	if (!select) {
    		classes = `${classes} svelte-fp-unselectable`;
    	}

    	const makePositive = num => {
    		//console.log(num);
    		let negative = false;

    		if (num < 0) {
    			negative = true;
    			num = -num;
    		}

    		//console.log(num);
    		//console.log(negative);
    		return { num, negative };
    	};

    	const handleSelect = () => {
    		if (!select) {
    			return false;
    		}
    	};

    	const slideRight = () => {
    		const active = makePositive(activeSlide);

    		if (active.num < slides.length - 1) {
    			$$invalidate(5, activeSlideIndicator = active.num + 1);
    			$$invalidate(16, activeSlide = -activeSlideIndicator);
    		} else {
    			$$invalidate(16, activeSlide = 0);
    			$$invalidate(5, activeSlideIndicator = activeSlide);
    		}
    	};

    	const slideLeft = () => {
    		const active = makePositive(activeSlide);

    		if (active.num > 0) {
    			$$invalidate(16, activeSlide = active.num - 1);
    		} else {
    			$$invalidate(16, activeSlide = slides.length - 1);
    		}

    		$$invalidate(5, activeSlideIndicator = activeSlide);
    	};

    	const toSlide = slideId => {
    		if (slideId > activeSlideIndicator) {
    			while (slideId > activeSlideIndicator) {
    				slideRight();
    			}
    		} else {
    			while (slideId < activeSlideIndicator) {
    				slideLeft();
    			}
    		}
    	};

    	//function that handles arrow event
    	const handleKey = event => {
    		if (arrows) {
    			switch (event.key) {
    				case "ArrowLeft":
    					slideLeft();
    					break;
    				case "ArrowRight":
    					slideRight();
    					break;
    			}
    		}
    	};

    	//function that handles drag start event
    	const handleDragStart = event => {
    		dragStartPosition = event.screenX;
    	};

    	//function that handles drag end event
    	const handleDragEnd = event => {
    		const dragEndPosition = event.screenX;

    		if (dragStartPosition - dragEndPosition > dragThreshold) {
    			slideRight();
    		} else if (dragStartPosition - dragEndPosition < -dragThreshold) {
    			slideLeft();
    		}
    	};

    	//function that handles touch event
    	const handleTouchStart = event => {
    		//event.preventDefault();
    		touchStartPosition = event.touches[0].screenX;
    	};

    	const handleTouchEnd = event => {
    		//event.preventDefault();
    		let timer = new Date().getTime();

    		const touchEndPosition = event.touches[0].screenX;

    		if (transitionDuration < timer - recentSlide) {
    			if (touchStartPosition - touchEndPosition > touchThreshold) {
    				slideRight();
    				recentSlide = timer;
    			} else if (touchStartPosition - touchEndPosition < -touchThreshold) {
    				slideLeft();
    				recentSlide = timer;
    			}
    		}
    	};

    	onMount(() => {
    		$$invalidate(4, sectionId = getId());
    	});

    	const writable_props = [
    		"class",
    		"style",
    		"slides",
    		"activeSlide",
    		"center",
    		"arrows",
    		"select",
    		"transitionDuration",
    		"dragThreshold",
    		"touchThreshold",
    		"transition"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FullpageSection> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FullpageSection", $$slots, ['default']);
    	const keydown_handler = event => handleKey(event);
    	const click_handler = index => toSlide(index);
    	const mousedown_handler = event => handleDragStart(event);
    	const mouseup_handler = event => handleDragEnd(event);
    	const touchstart_handler = event => handleTouchStart(event);
    	const touchmove_handler = event => handleTouchEnd(event);

    	$$self.$set = $$props => {
    		if ("class" in $$props) $$invalidate(17, defaultClasses = $$props.class);
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    		if ("slides" in $$props) $$invalidate(1, slides = $$props.slides);
    		if ("activeSlide" in $$props) $$invalidate(16, activeSlide = $$props.activeSlide);
    		if ("center" in $$props) $$invalidate(2, center = $$props.center);
    		if ("arrows" in $$props) $$invalidate(18, arrows = $$props.arrows);
    		if ("select" in $$props) $$invalidate(19, select = $$props.select);
    		if ("transitionDuration" in $$props) $$invalidate(20, transitionDuration = $$props.transitionDuration);
    		if ("dragThreshold" in $$props) $$invalidate(21, dragThreshold = $$props.dragThreshold);
    		if ("touchThreshold" in $$props) $$invalidate(22, touchThreshold = $$props.touchThreshold);
    		if ("transition" in $$props) $$invalidate(3, transition = $$props.transition);
    		if ("$$scope" in $$props) $$invalidate(30, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		getContext,
    		onMount,
    		defaultClasses,
    		style,
    		sectionId,
    		getId,
    		activeSectionStore,
    		slides,
    		activeSlide,
    		center,
    		arrows,
    		select,
    		transitionDuration,
    		dragThreshold,
    		touchThreshold,
    		transition,
    		activeSlideIndicator,
    		dragStartPosition,
    		touchStartPosition,
    		recentSlide,
    		classes,
    		makePositive,
    		handleSelect,
    		slideRight,
    		slideLeft,
    		toSlide,
    		handleKey,
    		handleDragStart,
    		handleDragEnd,
    		handleTouchStart,
    		handleTouchEnd,
    		$activeSectionStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("defaultClasses" in $$props) $$invalidate(17, defaultClasses = $$props.defaultClasses);
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    		if ("sectionId" in $$props) $$invalidate(4, sectionId = $$props.sectionId);
    		if ("slides" in $$props) $$invalidate(1, slides = $$props.slides);
    		if ("activeSlide" in $$props) $$invalidate(16, activeSlide = $$props.activeSlide);
    		if ("center" in $$props) $$invalidate(2, center = $$props.center);
    		if ("arrows" in $$props) $$invalidate(18, arrows = $$props.arrows);
    		if ("select" in $$props) $$invalidate(19, select = $$props.select);
    		if ("transitionDuration" in $$props) $$invalidate(20, transitionDuration = $$props.transitionDuration);
    		if ("dragThreshold" in $$props) $$invalidate(21, dragThreshold = $$props.dragThreshold);
    		if ("touchThreshold" in $$props) $$invalidate(22, touchThreshold = $$props.touchThreshold);
    		if ("transition" in $$props) $$invalidate(3, transition = $$props.transition);
    		if ("activeSlideIndicator" in $$props) $$invalidate(5, activeSlideIndicator = $$props.activeSlideIndicator);
    		if ("dragStartPosition" in $$props) dragStartPosition = $$props.dragStartPosition;
    		if ("touchStartPosition" in $$props) touchStartPosition = $$props.touchStartPosition;
    		if ("recentSlide" in $$props) recentSlide = $$props.recentSlide;
    		if ("classes" in $$props) $$invalidate(6, classes = $$props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		style,
    		slides,
    		center,
    		transition,
    		sectionId,
    		activeSlideIndicator,
    		classes,
    		$activeSectionStore,
    		activeSectionStore,
    		handleSelect,
    		toSlide,
    		handleKey,
    		handleDragStart,
    		handleDragEnd,
    		handleTouchStart,
    		handleTouchEnd,
    		activeSlide,
    		defaultClasses,
    		arrows,
    		select,
    		transitionDuration,
    		dragThreshold,
    		touchThreshold,
    		dragStartPosition,
    		touchStartPosition,
    		recentSlide,
    		getId,
    		makePositive,
    		slideRight,
    		slideLeft,
    		$$scope,
    		$$slots,
    		keydown_handler,
    		click_handler,
    		mousedown_handler,
    		mouseup_handler,
    		touchstart_handler,
    		touchmove_handler
    	];
    }

    class FullpageSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				class: 17,
    				style: 0,
    				slides: 1,
    				activeSlide: 16,
    				center: 2,
    				arrows: 18,
    				select: 19,
    				transitionDuration: 20,
    				dragThreshold: 21,
    				touchThreshold: 22,
    				transition: 3
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FullpageSection",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get class() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get slides() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slides(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSlide() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSlide(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get arrows() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arrows(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get select() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set select(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionDuration() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionDuration(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dragThreshold() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dragThreshold(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get touchThreshold() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set touchThreshold(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* home/filip/Programming/OpenSource/svelte/svelte-fullpage/src/FullpageSlide.svelte generated by Svelte v3.20.1 */
    const file$4 = "home/filip/Programming/OpenSource/svelte/svelte-fullpage/src/FullpageSlide.svelte";

    // (42:0) {#if slideId === activeSlide}
    function create_if_block$2(ctx) {
    	let div;
    	let div_class_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`${/*defaultClasses*/ ctx[4]} svelte-fp-content`) + " svelte-1jzpibp"));
    			attr_dev(div, "style", /*style*/ ctx[5]);
    			toggle_class(div, "svelte-fp-flexbox-center", /*center*/ ctx[6]);
    			add_location(div, file$4, 42, 4, 958);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[8], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null));
    				}
    			}

    			if (!current || dirty & /*defaultClasses*/ 16 && div_class_value !== (div_class_value = "" + (null_to_empty(`${/*defaultClasses*/ ctx[4]} svelte-fp-content`) + " svelte-1jzpibp"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 32) {
    				attr_dev(div, "style", /*style*/ ctx[5]);
    			}

    			if (dirty & /*defaultClasses, center*/ 80) {
    				toggle_class(div, "svelte-fp-flexbox-center", /*center*/ ctx[6]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, /*transitionIn*/ ctx[2]);
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, /*transitionOut*/ ctx[3]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(42:0) {#if slideId === activeSlide}",
    		ctx
    	});

    	return block;
    }

    // (44:14)          
    function fallback_block$1(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(44:14)          ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*slideId*/ ctx[0] === /*activeSlide*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*slideId*/ ctx[0] === /*activeSlide*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { class: defaultClasses = "" } = $$props;
    	let { style = "" } = $$props;
    	let { slideId } = $$props;
    	let { activeSlide } = $$props;
    	let { center = false } = $$props;
    	let { transitionIn = { duration: 500, x: -2000 } } = $$props;
    	let { transitionOut = { duration: 500, x: 2000 } } = $$props;
    	slideId = parseInt(slideId);

    	const makePositive = num => {
    		let negative = false;

    		if (num < 0) {
    			negative = true;
    			num = -num;
    		}

    		return { num, negative };
    	};

    	const writable_props = [
    		"class",
    		"style",
    		"slideId",
    		"activeSlide",
    		"center",
    		"transitionIn",
    		"transitionOut"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FullpageSlide> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FullpageSlide", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("class" in $$props) $$invalidate(4, defaultClasses = $$props.class);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    		if ("slideId" in $$props) $$invalidate(0, slideId = $$props.slideId);
    		if ("activeSlide" in $$props) $$invalidate(1, activeSlide = $$props.activeSlide);
    		if ("center" in $$props) $$invalidate(6, center = $$props.center);
    		if ("transitionIn" in $$props) $$invalidate(2, transitionIn = $$props.transitionIn);
    		if ("transitionOut" in $$props) $$invalidate(3, transitionOut = $$props.transitionOut);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		defaultClasses,
    		style,
    		slideId,
    		activeSlide,
    		center,
    		transitionIn,
    		transitionOut,
    		makePositive
    	});

    	$$self.$inject_state = $$props => {
    		if ("defaultClasses" in $$props) $$invalidate(4, defaultClasses = $$props.defaultClasses);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    		if ("slideId" in $$props) $$invalidate(0, slideId = $$props.slideId);
    		if ("activeSlide" in $$props) $$invalidate(1, activeSlide = $$props.activeSlide);
    		if ("center" in $$props) $$invalidate(6, center = $$props.center);
    		if ("transitionIn" in $$props) $$invalidate(2, transitionIn = $$props.transitionIn);
    		if ("transitionOut" in $$props) $$invalidate(3, transitionOut = $$props.transitionOut);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*activeSlide*/ 2) {
    			 {
    				const state = makePositive(activeSlide);

    				if (state.negative) {
    					$$invalidate(2, transitionIn.x = 2000, transitionIn);
    					$$invalidate(3, transitionOut.x = -2000, transitionOut);
    				} else {
    					$$invalidate(2, transitionIn.x = -2000, transitionIn);
    					$$invalidate(3, transitionOut.x = 2000, transitionOut);
    				}

    				$$invalidate(1, activeSlide = state.num);
    			}
    		}
    	};

    	return [
    		slideId,
    		activeSlide,
    		transitionIn,
    		transitionOut,
    		defaultClasses,
    		style,
    		center,
    		makePositive,
    		$$scope,
    		$$slots
    	];
    }

    class FullpageSlide extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			class: 4,
    			style: 5,
    			slideId: 0,
    			activeSlide: 1,
    			center: 6,
    			transitionIn: 2,
    			transitionOut: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FullpageSlide",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*slideId*/ ctx[0] === undefined && !("slideId" in props)) {
    			console.warn("<FullpageSlide> was created without expected prop 'slideId'");
    		}

    		if (/*activeSlide*/ ctx[1] === undefined && !("activeSlide" in props)) {
    			console.warn("<FullpageSlide> was created without expected prop 'activeSlide'");
    		}
    	}

    	get class() {
    		throw new Error("<FullpageSlide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<FullpageSlide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<FullpageSlide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<FullpageSlide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get slideId() {
    		throw new Error("<FullpageSlide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slideId(value) {
    		throw new Error("<FullpageSlide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSlide() {
    		throw new Error("<FullpageSlide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSlide(value) {
    		throw new Error("<FullpageSlide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<FullpageSlide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<FullpageSlide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionIn() {
    		throw new Error("<FullpageSlide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionIn(value) {
    		throw new Error("<FullpageSlide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionOut() {
    		throw new Error("<FullpageSlide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionOut(value) {
    		throw new Error("<FullpageSlide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function toVal(mix) {
    	var k, y, str='';
    	if (mix) {
    		if (typeof mix === 'object') {
    			if (Array.isArray(mix)) {
    				for (k=0; k < mix.length; k++) {
    					if (mix[k] && (y = toVal(mix[k]))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			} else {
    				for (k in mix) {
    					if (mix[k] && (y = toVal(k))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			}
    		} else if (typeof mix !== 'boolean' && !mix.call) {
    			str && (str += ' ');
    			str += mix;
    		}
    	}
    	return str;
    }

    function clsx () {
    	var i=0, x, str='';
    	while (i < arguments.length) {
    		if (x = toVal(arguments[i++])) {
    			str && (str += ' ');
    			str += x;
    		}
    	}
    	return str;
    }

    function isObject(value) {
      const type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    function getColumnSizeClass(isXs, colWidth, colSize) {
      if (colSize === true || colSize === '') {
        return isXs ? 'col' : `col-${colWidth}`;
      } else if (colSize === 'auto') {
        return isXs ? 'col-auto' : `col-${colWidth}-auto`;
      }

      return isXs ? `col-${colSize}` : `col-${colWidth}-${colSize}`;
    }

    function clean($$props) {
      const rest = {};
      for (const key of Object.keys($$props)) {
        if (key !== "children" && key !== "$$scope" && key !== "$$slots") {
          rest[key] = $$props[key];
        }
      }
      return rest;
    }

    /* node_modules/sveltestrap/src/Col.svelte generated by Svelte v3.20.1 */
    const file$5 = "node_modules/sveltestrap/src/Col.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	let div_levels = [
    		/*props*/ ctx[1],
    		{ id: /*id*/ ctx[0] },
    		{ class: /*colClasses*/ ctx[2].join(" ") }
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$5, 51, 0, 1305);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    				}
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*id*/ 1 && { id: /*id*/ ctx[0] },
    				dirty & /*colClasses*/ 4 && { class: /*colClasses*/ ctx[2].join(" ") }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { id = "" } = $$props;
    	const props = clean($$props);
    	const colClasses = [];
    	const widths = ["xs", "sm", "md", "lg", "xl"];

    	widths.forEach(colWidth => {
    		const columnProp = $$props[colWidth];

    		if (!columnProp && columnProp !== "") {
    			return; //no value for this width
    		}

    		const isXs = colWidth === "xs";

    		if (isObject(columnProp)) {
    			const colSizeInterfix = isXs ? "-" : `-${colWidth}-`;
    			const colClass = getColumnSizeClass(isXs, colWidth, columnProp.size);

    			if (columnProp.size || columnProp.size === "") {
    				colClasses.push(colClass);
    			}

    			if (columnProp.push) {
    				colClasses.push(`push${colSizeInterfix}${columnProp.push}`);
    			}

    			if (columnProp.pull) {
    				colClasses.push(`pull${colSizeInterfix}${columnProp.pull}`);
    			}

    			if (columnProp.offset) {
    				colClasses.push(`offset${colSizeInterfix}${columnProp.offset}`);
    			}
    		} else {
    			colClasses.push(getColumnSizeClass(isXs, colWidth, columnProp));
    		}
    	});

    	if (!colClasses.length) {
    		colClasses.push("col");
    	}

    	if (className) {
    		colClasses.push(className);
    	}

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Col", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(3, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(0, id = $$new_props.id);
    		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clean,
    		getColumnSizeClass,
    		isObject,
    		className,
    		id,
    		props,
    		colClasses,
    		widths
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(3, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(0, id = $$new_props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [id, props, colClasses, className, widths, $$props, $$scope, $$slots];
    }

    class Col extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { class: 3, id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Col",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/Container.svelte generated by Svelte v3.20.1 */
    const file$6 = "node_modules/sveltestrap/src/Container.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
    	let div_levels = [/*props*/ ctx[2], { id: /*id*/ ctx[0] }, { class: /*classes*/ ctx[1] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$6, 14, 0, 295);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    				}
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				dirty & /*props*/ 4 && /*props*/ ctx[2],
    				dirty & /*id*/ 1 && { id: /*id*/ ctx[0] },
    				dirty & /*classes*/ 2 && { class: /*classes*/ ctx[1] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { fluid = false } = $$props;
    	let { id = "" } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Container", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(3, className = $$new_props.class);
    		if ("fluid" in $$new_props) $$invalidate(4, fluid = $$new_props.fluid);
    		if ("id" in $$new_props) $$invalidate(0, id = $$new_props.id);
    		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		fluid,
    		id,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(3, className = $$new_props.className);
    		if ("fluid" in $$props) $$invalidate(4, fluid = $$new_props.fluid);
    		if ("id" in $$props) $$invalidate(0, id = $$new_props.id);
    		if ("classes" in $$props) $$invalidate(1, classes = $$new_props.classes);
    	};

    	let classes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, fluid*/ 24) {
    			 $$invalidate(1, classes = clsx(className, fluid ? "container-fluid" : "container"));
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [id, classes, props, className, fluid, $$props, $$scope, $$slots];
    }

    class Container extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { class: 3, fluid: 4, id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Container",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fluid() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fluid(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/Row.svelte generated by Svelte v3.20.1 */
    const file$7 = "node_modules/sveltestrap/src/Row.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);
    	let div_levels = [/*props*/ ctx[2], { id: /*id*/ ctx[0] }, { class: /*classes*/ ctx[1] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$7, 19, 0, 361);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[7], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null));
    				}
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				dirty & /*props*/ 4 && /*props*/ ctx[2],
    				dirty & /*id*/ 1 && { id: /*id*/ ctx[0] },
    				dirty & /*classes*/ 2 && { class: /*classes*/ ctx[1] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { noGutters = false } = $$props;
    	let { form = false } = $$props;
    	let { id = "" } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Row", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(3, className = $$new_props.class);
    		if ("noGutters" in $$new_props) $$invalidate(4, noGutters = $$new_props.noGutters);
    		if ("form" in $$new_props) $$invalidate(5, form = $$new_props.form);
    		if ("id" in $$new_props) $$invalidate(0, id = $$new_props.id);
    		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		noGutters,
    		form,
    		id,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(3, className = $$new_props.className);
    		if ("noGutters" in $$props) $$invalidate(4, noGutters = $$new_props.noGutters);
    		if ("form" in $$props) $$invalidate(5, form = $$new_props.form);
    		if ("id" in $$props) $$invalidate(0, id = $$new_props.id);
    		if ("classes" in $$props) $$invalidate(1, classes = $$new_props.classes);
    	};

    	let classes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, noGutters, form*/ 56) {
    			 $$invalidate(1, classes = clsx(className, noGutters ? "no-gutters" : null, form ? "form-row" : "row"));
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [id, classes, props, className, noGutters, form, $$props, $$scope, $$slots];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { class: 3, noGutters: 4, form: 5, id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get class() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutters() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutters(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get form() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set form(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.20.1 */
    const file$8 = "src/App.svelte";

    // (42:4) <Col>
    function create_default_slot_22(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Svelte Fullpage";
    			t1 = space();
    			p = element("p");
    			p.textContent = "This page is made using svelte-fullpage component, try to scroll, drag with mouse or swipe\n\t\t\t\t\t\tvertical with finger or use arrows to scroll.";
    			add_location(h1, file$8, 42, 5, 824);
    			add_location(p, file$8, 45, 5, 867);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_22.name,
    		type: "slot",
    		source: "(42:4) <Col>",
    		ctx
    	});

    	return block;
    }

    // (41:3) <Row>
    function create_default_slot_21(ctx) {
    	let current;

    	const col = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_22] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				col_changes.$$scope = { dirty, ctx };
    			}

    			col.$set(col_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_21.name,
    		type: "slot",
    		source: "(41:3) <Row>",
    		ctx
    	});

    	return block;
    }

    // (40:2) <Container class="text-center">
    function create_default_slot_20(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_21] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_20.name,
    		type: "slot",
    		source: "(40:2) <Container class=\\\"text-center\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:1) <FullpageSection sectionId="0" center>
    function create_default_slot_19(ctx) {
    	let current;

    	const container = new Container({
    			props: {
    				class: "text-center",
    				$$slots: { default: [create_default_slot_20] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(container.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(container, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_19.name,
    		type: "slot",
    		source: "(39:1) <FullpageSection sectionId=\\\"0\\\" center>",
    		ctx
    	});

    	return block;
    }

    // (58:5) <Col>
    function create_default_slot_18(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Slides";
    			t1 = space();
    			p = element("p");
    			p.textContent = "There is also component for slides as you can see.\n\t\t\t\t\t\t\tTry to drag/swipe right or left, also you can use arrows.";
    			add_location(h1, file$8, 58, 6, 1284);
    			add_location(p, file$8, 59, 6, 1306);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_18.name,
    		type: "slot",
    		source: "(58:5) <Col>",
    		ctx
    	});

    	return block;
    }

    // (57:4) <Row>
    function create_default_slot_17(ctx) {
    	let current;

    	const col = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_18] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				col_changes.$$scope = { dirty, ctx };
    			}

    			col.$set(col_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17.name,
    		type: "slot",
    		source: "(57:4) <Row>",
    		ctx
    	});

    	return block;
    }

    // (56:3) <Container class="text-center">
    function create_default_slot_16(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_17] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(56:3) <Container class=\\\"text-center\\\">",
    		ctx
    	});

    	return block;
    }

    // (55:2) <FullpageSlide slideId="0" bind:activeSlide center>
    function create_default_slot_15(ctx) {
    	let current;

    	const container = new Container({
    			props: {
    				class: "text-center",
    				$$slots: { default: [create_default_slot_16] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(container.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(container, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(55:2) <FullpageSlide slideId=\\\"0\\\" bind:activeSlide center>",
    		ctx
    	});

    	return block;
    }

    // (71:5) <Col>
    function create_default_slot_14(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Another slide";
    			t1 = space();
    			p = element("p");
    			p.textContent = "You can style every individual slide, notice background change.";
    			add_location(h1, file$8, 71, 6, 1636);
    			add_location(p, file$8, 72, 6, 1665);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(71:5) <Col>",
    		ctx
    	});

    	return block;
    }

    // (70:4) <Row>
    function create_default_slot_13(ctx) {
    	let current;

    	const col = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_14] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				col_changes.$$scope = { dirty, ctx };
    			}

    			col.$set(col_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(70:4) <Row>",
    		ctx
    	});

    	return block;
    }

    // (69:3) <Container class="text-center">
    function create_default_slot_12(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(69:3) <Container class=\\\"text-center\\\">",
    		ctx
    	});

    	return block;
    }

    // (68:2) <FullpageSlide slideId="1" bind:activeSlide class="bg-danger" center>
    function create_default_slot_11(ctx) {
    	let current;

    	const container = new Container({
    			props: {
    				class: "text-center",
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(container.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(container, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(68:2) <FullpageSlide slideId=\\\"1\\\" bind:activeSlide class=\\\"bg-danger\\\" center>",
    		ctx
    	});

    	return block;
    }

    // (83:5) <Col>
    function create_default_slot_10(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Embeds";
    			t1 = space();
    			p = element("p");
    			p.textContent = "svelte-fullpage supports also embeds and iframes, scroll down to see example, you will see\n\t\t\t\t\t\t\tpage but loaded using embed. Scrolling on embaded page is enabled, but also fulpage\n\t\t\t\t\t\t\tscrolling is still working, try to scroll hovering over fullpage section indicator (grey dots).";
    			add_location(h1, file$8, 83, 6, 1944);
    			add_location(p, file$8, 84, 6, 1966);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(83:5) <Col>",
    		ctx
    	});

    	return block;
    }

    // (82:4) <Row>
    function create_default_slot_9(ctx) {
    	let current;

    	const col = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				col_changes.$$scope = { dirty, ctx };
    			}

    			col.$set(col_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(82:4) <Row>",
    		ctx
    	});

    	return block;
    }

    // (81:3) <Container class="text-center">
    function create_default_slot_8(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(81:3) <Container class=\\\"text-center\\\">",
    		ctx
    	});

    	return block;
    }

    // (80:2) <FullpageSlide slideId="2" bind:activeSlide class="bg-success" center>
    function create_default_slot_7(ctx) {
    	let current;

    	const container = new Container({
    			props: {
    				class: "text-center",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(container.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(container, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(80:2) <FullpageSlide slideId=\\\"2\\\" bind:activeSlide class=\\\"bg-success\\\" center>",
    		ctx
    	});

    	return block;
    }

    // (54:1) <FullpageSection sectionId="1" bind:activeSlide {slides} class="bg-info" arrows>
    function create_default_slot_6(ctx) {
    	let updating_activeSlide;
    	let t0;
    	let updating_activeSlide_1;
    	let t1;
    	let updating_activeSlide_2;
    	let current;

    	function fullpageslide0_activeSlide_binding(value) {
    		/*fullpageslide0_activeSlide_binding*/ ctx[4].call(null, value);
    	}

    	let fullpageslide0_props = {
    		slideId: "0",
    		center: true,
    		$$slots: { default: [create_default_slot_15] },
    		$$scope: { ctx }
    	};

    	if (/*activeSlide*/ ctx[1] !== void 0) {
    		fullpageslide0_props.activeSlide = /*activeSlide*/ ctx[1];
    	}

    	const fullpageslide0 = new FullpageSlide({
    			props: fullpageslide0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(fullpageslide0, "activeSlide", fullpageslide0_activeSlide_binding));

    	function fullpageslide1_activeSlide_binding(value) {
    		/*fullpageslide1_activeSlide_binding*/ ctx[5].call(null, value);
    	}

    	let fullpageslide1_props = {
    		slideId: "1",
    		class: "bg-danger",
    		center: true,
    		$$slots: { default: [create_default_slot_11] },
    		$$scope: { ctx }
    	};

    	if (/*activeSlide*/ ctx[1] !== void 0) {
    		fullpageslide1_props.activeSlide = /*activeSlide*/ ctx[1];
    	}

    	const fullpageslide1 = new FullpageSlide({
    			props: fullpageslide1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(fullpageslide1, "activeSlide", fullpageslide1_activeSlide_binding));

    	function fullpageslide2_activeSlide_binding(value) {
    		/*fullpageslide2_activeSlide_binding*/ ctx[6].call(null, value);
    	}

    	let fullpageslide2_props = {
    		slideId: "2",
    		class: "bg-success",
    		center: true,
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	};

    	if (/*activeSlide*/ ctx[1] !== void 0) {
    		fullpageslide2_props.activeSlide = /*activeSlide*/ ctx[1];
    	}

    	const fullpageslide2 = new FullpageSlide({
    			props: fullpageslide2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(fullpageslide2, "activeSlide", fullpageslide2_activeSlide_binding));

    	const block = {
    		c: function create() {
    			create_component(fullpageslide0.$$.fragment);
    			t0 = space();
    			create_component(fullpageslide1.$$.fragment);
    			t1 = space();
    			create_component(fullpageslide2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fullpageslide0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(fullpageslide1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(fullpageslide2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const fullpageslide0_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				fullpageslide0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_activeSlide && dirty & /*activeSlide*/ 2) {
    				updating_activeSlide = true;
    				fullpageslide0_changes.activeSlide = /*activeSlide*/ ctx[1];
    				add_flush_callback(() => updating_activeSlide = false);
    			}

    			fullpageslide0.$set(fullpageslide0_changes);
    			const fullpageslide1_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				fullpageslide1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_activeSlide_1 && dirty & /*activeSlide*/ 2) {
    				updating_activeSlide_1 = true;
    				fullpageslide1_changes.activeSlide = /*activeSlide*/ ctx[1];
    				add_flush_callback(() => updating_activeSlide_1 = false);
    			}

    			fullpageslide1.$set(fullpageslide1_changes);
    			const fullpageslide2_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				fullpageslide2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_activeSlide_2 && dirty & /*activeSlide*/ 2) {
    				updating_activeSlide_2 = true;
    				fullpageslide2_changes.activeSlide = /*activeSlide*/ ctx[1];
    				add_flush_callback(() => updating_activeSlide_2 = false);
    			}

    			fullpageslide2.$set(fullpageslide2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fullpageslide0.$$.fragment, local);
    			transition_in(fullpageslide1.$$.fragment, local);
    			transition_in(fullpageslide2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fullpageslide0.$$.fragment, local);
    			transition_out(fullpageslide1.$$.fragment, local);
    			transition_out(fullpageslide2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fullpageslide0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(fullpageslide1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(fullpageslide2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(54:1) <FullpageSection sectionId=\\\"1\\\" bind:activeSlide {slides} class=\\\"bg-info\\\" arrows>",
    		ctx
    	});

    	return block;
    }

    // (95:1) <FullpageSection sectionId="2" center>
    function create_default_slot_5(ctx) {
    	let embed;
    	let embed_src_value;

    	const block = {
    		c: function create() {
    			embed = element("embed");
    			if (embed.src !== (embed_src_value = "https://github.com/Hejtmus/svelte-fullpage#svelte-fullpage")) attr_dev(embed, "src", embed_src_value);
    			attr_dev(embed, "csp", "https://github.com");
    			attr_dev(embed, "class", "w-100 h-100");
    			add_location(embed, file$8, 95, 2, 2393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, embed, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(embed);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(95:1) <FullpageSection sectionId=\\\"2\\\" center>",
    		ctx
    	});

    	return block;
    }

    // (101:4) <Col>
    function create_default_slot_4(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Future of this component";
    			t1 = space();
    			p = element("p");
    			p.textContent = "This component is in development and is far from being ideal, as you noticed (maybe), there\n\t\t\t\t\t\tis problem with slide animation. Currently I'm the only contributor of this project, feel free\n\t\t\t\t\t\tto fork it and make pull request.";
    			add_location(h1, file$8, 101, 5, 2667);
    			add_location(p, file$8, 102, 5, 2706);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(101:4) <Col>",
    		ctx
    	});

    	return block;
    }

    // (100:3) <Row>
    function create_default_slot_3(ctx) {
    	let current;

    	const col = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				col_changes.$$scope = { dirty, ctx };
    			}

    			col.$set(col_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(100:3) <Row>",
    		ctx
    	});

    	return block;
    }

    // (99:2) <Container class="text-center">
    function create_default_slot_2(ctx) {
    	let current;

    	const row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(99:2) <Container class=\\\"text-center\\\">",
    		ctx
    	});

    	return block;
    }

    // (98:1) <FullpageSection sectionId="3" bind:activeSection class="bg-warning" center>
    function create_default_slot_1(ctx) {
    	let current;

    	const container = new Container({
    			props: {
    				class: "text-center",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(container.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(container, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(98:1) <FullpageSection sectionId=\\\"3\\\" bind:activeSection class=\\\"bg-warning\\\" center>",
    		ctx
    	});

    	return block;
    }

    // (38:0) <Fullpage bind:activeSection arrows drag>
    function create_default_slot(ctx) {
    	let t0;
    	let updating_activeSlide;
    	let t1;
    	let t2;
    	let updating_activeSection;
    	let current;

    	const fullpagesection0 = new FullpageSection({
    			props: {
    				sectionId: "0",
    				center: true,
    				$$slots: { default: [create_default_slot_19] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function fullpagesection1_activeSlide_binding(value) {
    		/*fullpagesection1_activeSlide_binding*/ ctx[7].call(null, value);
    	}

    	let fullpagesection1_props = {
    		sectionId: "1",
    		slides: /*slides*/ ctx[2],
    		class: "bg-info",
    		arrows: true,
    		$$slots: { default: [create_default_slot_6] },
    		$$scope: { ctx }
    	};

    	if (/*activeSlide*/ ctx[1] !== void 0) {
    		fullpagesection1_props.activeSlide = /*activeSlide*/ ctx[1];
    	}

    	const fullpagesection1 = new FullpageSection({
    			props: fullpagesection1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(fullpagesection1, "activeSlide", fullpagesection1_activeSlide_binding));

    	const fullpagesection2 = new FullpageSection({
    			props: {
    				sectionId: "2",
    				center: true,
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function fullpagesection3_activeSection_binding(value) {
    		/*fullpagesection3_activeSection_binding*/ ctx[8].call(null, value);
    	}

    	let fullpagesection3_props = {
    		sectionId: "3",
    		class: "bg-warning",
    		center: true,
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*activeSection*/ ctx[0] !== void 0) {
    		fullpagesection3_props.activeSection = /*activeSection*/ ctx[0];
    	}

    	const fullpagesection3 = new FullpageSection({
    			props: fullpagesection3_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(fullpagesection3, "activeSection", fullpagesection3_activeSection_binding));

    	const block = {
    		c: function create() {
    			create_component(fullpagesection0.$$.fragment);
    			t0 = space();
    			create_component(fullpagesection1.$$.fragment);
    			t1 = space();
    			create_component(fullpagesection2.$$.fragment);
    			t2 = space();
    			create_component(fullpagesection3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fullpagesection0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(fullpagesection1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(fullpagesection2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(fullpagesection3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const fullpagesection0_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				fullpagesection0_changes.$$scope = { dirty, ctx };
    			}

    			fullpagesection0.$set(fullpagesection0_changes);
    			const fullpagesection1_changes = {};

    			if (dirty & /*$$scope, activeSlide*/ 1026) {
    				fullpagesection1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_activeSlide && dirty & /*activeSlide*/ 2) {
    				updating_activeSlide = true;
    				fullpagesection1_changes.activeSlide = /*activeSlide*/ ctx[1];
    				add_flush_callback(() => updating_activeSlide = false);
    			}

    			fullpagesection1.$set(fullpagesection1_changes);
    			const fullpagesection2_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				fullpagesection2_changes.$$scope = { dirty, ctx };
    			}

    			fullpagesection2.$set(fullpagesection2_changes);
    			const fullpagesection3_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				fullpagesection3_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_activeSection && dirty & /*activeSection*/ 1) {
    				updating_activeSection = true;
    				fullpagesection3_changes.activeSection = /*activeSection*/ ctx[0];
    				add_flush_callback(() => updating_activeSection = false);
    			}

    			fullpagesection3.$set(fullpagesection3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fullpagesection0.$$.fragment, local);
    			transition_in(fullpagesection1.$$.fragment, local);
    			transition_in(fullpagesection2.$$.fragment, local);
    			transition_in(fullpagesection3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fullpagesection0.$$.fragment, local);
    			transition_out(fullpagesection1.$$.fragment, local);
    			transition_out(fullpagesection2.$$.fragment, local);
    			transition_out(fullpagesection3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fullpagesection0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(fullpagesection1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(fullpagesection2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(fullpagesection3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(38:0) <Fullpage bind:activeSection arrows drag>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let t;
    	let updating_activeSection;
    	let current;

    	function fullpage_activeSection_binding(value) {
    		/*fullpage_activeSection_binding*/ ctx[9].call(null, value);
    	}

    	let fullpage_props = {
    		arrows: true,
    		drag: true,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*activeSection*/ ctx[0] !== void 0) {
    		fullpage_props.activeSection = /*activeSection*/ ctx[0];
    	}

    	const fullpage = new Fullpage({ props: fullpage_props, $$inline: true });
    	binding_callbacks.push(() => bind(fullpage, "activeSection", fullpage_activeSection_binding));

    	const block = {
    		c: function create() {
    			t = space();
    			create_component(fullpage.$$.fragment);
    			document.title = "Svelte-fullpage";
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(fullpage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const fullpage_changes = {};

    			if (dirty & /*$$scope, activeSection, activeSlide*/ 1027) {
    				fullpage_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_activeSection && dirty & /*activeSection*/ 1) {
    				updating_activeSection = true;
    				fullpage_changes.activeSection = /*activeSection*/ ctx[0];
    				add_flush_callback(() => updating_activeSection = false);
    			}

    			fullpage.$set(fullpage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fullpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fullpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(fullpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	const sections = ["Svelte Fullpage", "Features", "GitHub", "Future"];

    	//Have to set to 0 (or section you wish to display as default), otherwise section will not display
    	let activeSection = 0;

    	//Same mechanics as in sections
    	const slides = ["slides", "arrows", "drag"];

    	//Also has to be 0 or specific id of slide
    	let activeSlide = 0;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function fullpageslide0_activeSlide_binding(value) {
    		activeSlide = value;
    		$$invalidate(1, activeSlide);
    	}

    	function fullpageslide1_activeSlide_binding(value) {
    		activeSlide = value;
    		$$invalidate(1, activeSlide);
    	}

    	function fullpageslide2_activeSlide_binding(value) {
    		activeSlide = value;
    		$$invalidate(1, activeSlide);
    	}

    	function fullpagesection1_activeSlide_binding(value) {
    		activeSlide = value;
    		$$invalidate(1, activeSlide);
    	}

    	function fullpagesection3_activeSection_binding(value) {
    		activeSection = value;
    		$$invalidate(0, activeSection);
    	}

    	function fullpage_activeSection_binding(value) {
    		activeSection = value;
    		$$invalidate(0, activeSection);
    	}

    	$$self.$capture_state = () => ({
    		Fullpage,
    		FullpageSection,
    		FullpageSlide,
    		Container,
    		Row,
    		Col,
    		sections,
    		activeSection,
    		slides,
    		activeSlide
    	});

    	$$self.$inject_state = $$props => {
    		if ("activeSection" in $$props) $$invalidate(0, activeSection = $$props.activeSection);
    		if ("activeSlide" in $$props) $$invalidate(1, activeSlide = $$props.activeSlide);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		activeSection,
    		activeSlide,
    		slides,
    		sections,
    		fullpageslide0_activeSlide_binding,
    		fullpageslide1_activeSlide_binding,
    		fullpageslide2_activeSlide_binding,
    		fullpagesection1_activeSlide_binding,
    		fullpagesection3_activeSection_binding,
    		fullpage_activeSection_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
