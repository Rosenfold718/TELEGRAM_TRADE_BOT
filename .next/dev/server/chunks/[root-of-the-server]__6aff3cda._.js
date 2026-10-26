module.exports = [
"[project]/node_modules/big-integer/BigInteger.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var bigInt = function(undefined) {
    "use strict";
    var BASE = 1e7, LOG_BASE = 7, MAX_INT = 9007199254740992, MAX_INT_ARR = smallToArray(MAX_INT), DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
    var supportsNativeBigInt = typeof BigInt === "function";
    function Integer(v, radix, alphabet, caseSensitive) {
        if (typeof v === "undefined") return Integer[0];
        if (typeof radix !== "undefined") return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
        return parseValue(v);
    }
    function BigInteger(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false;
    }
    BigInteger.prototype = Object.create(Integer.prototype);
    function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0;
        this.isSmall = true;
    }
    SmallInteger.prototype = Object.create(Integer.prototype);
    function NativeBigInt(value) {
        this.value = value;
    }
    NativeBigInt.prototype = Object.create(Integer.prototype);
    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }
    function smallToArray(n) {
        if (n < 1e7) return [
            n
        ];
        if (n < 1e14) return [
            n % 1e7,
            Math.floor(n / 1e7)
        ];
        return [
            n % 1e7,
            Math.floor(n / 1e7) % 1e7,
            Math.floor(n / 1e14)
        ];
    }
    function arrayToSmall(arr) {
        trim(arr);
        var length = arr.length;
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch(length){
                case 0:
                    return 0;
                case 1:
                    return arr[0];
                case 2:
                    return arr[0] + arr[1] * BASE;
                default:
                    return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
            }
        }
        return arr;
    }
    function trim(v) {
        var i = v.length;
        while(v[--i] === 0);
        v.length = i + 1;
    }
    function createArray(length) {
        var x = new Array(length);
        var i = -1;
        while(++i < length){
            x[i] = 0;
        }
        return x;
    }
    function truncate(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
    }
    function add(a, b) {
        var l_a = a.length, l_b = b.length, r = new Array(l_a), carry = 0, base = BASE, sum, i;
        for(i = 0; i < l_b; i++){
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }
        while(i < l_a){
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }
        if (carry > 0) r.push(carry);
        return r;
    }
    function addAny(a, b) {
        if (a.length >= b.length) return add(a, b);
        return add(b, a);
    }
    function addSmall(a, carry) {
        var l = a.length, r = new Array(l), base = BASE, sum, i;
        for(i = 0; i < l; i++){
            sum = a[i] - base + carry;
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1;
        }
        while(carry > 0){
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }
    BigInteger.prototype.add = function(v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.subtract(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }
        return new BigInteger(addAny(a, b), this.sign);
    };
    BigInteger.prototype.plus = BigInteger.prototype.add;
    SmallInteger.prototype.add = function(v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.subtract(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            if (isPrecise(a + b)) return new SmallInteger(a + b);
            b = smallToArray(Math.abs(b));
        }
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };
    SmallInteger.prototype.plus = SmallInteger.prototype.add;
    NativeBigInt.prototype.add = function(v) {
        return new NativeBigInt(this.value + parseValue(v).value);
    };
    NativeBigInt.prototype.plus = NativeBigInt.prototype.add;
    function subtract(a, b) {
        var a_l = a.length, b_l = b.length, r = new Array(a_l), borrow = 0, base = BASE, i, difference;
        for(i = 0; i < b_l; i++){
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow = 1;
            } else borrow = 0;
            r[i] = difference;
        }
        for(i = b_l; i < a_l; i++){
            difference = a[i] - borrow;
            if (difference < 0) difference += base;
            else {
                r[i++] = difference;
                break;
            }
            r[i] = difference;
        }
        for(; i < a_l; i++){
            r[i] = a[i];
        }
        trim(r);
        return r;
    }
    function subtractAny(a, b, sign) {
        var value;
        if (compareAbs(a, b) >= 0) {
            value = subtract(a, b);
        } else {
            value = subtract(b, a);
            sign = !sign;
        }
        value = arrayToSmall(value);
        if (typeof value === "number") {
            if (sign) value = -value;
            return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
    }
    function subtractSmall(a, b, sign) {
        var l = a.length, r = new Array(l), carry = -b, base = BASE, i, difference;
        for(i = 0; i < l; i++){
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference;
        }
        r = arrayToSmall(r);
        if (typeof r === "number") {
            if (sign) r = -r;
            return new SmallInteger(r);
        }
        return new BigInteger(r, sign);
    }
    BigInteger.prototype.subtract = function(v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.add(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall) return subtractSmall(a, Math.abs(b), this.sign);
        return subtractAny(a, b, this.sign);
    };
    BigInteger.prototype.minus = BigInteger.prototype.subtract;
    SmallInteger.prototype.subtract = function(v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.add(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            return new SmallInteger(a - b);
        }
        return subtractSmall(b, Math.abs(a), a >= 0);
    };
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;
    NativeBigInt.prototype.subtract = function(v) {
        return new NativeBigInt(this.value - parseValue(v).value);
    };
    NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;
    BigInteger.prototype.negate = function() {
        return new BigInteger(this.value, !this.sign);
    };
    SmallInteger.prototype.negate = function() {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign;
        return small;
    };
    NativeBigInt.prototype.negate = function() {
        return new NativeBigInt(-this.value);
    };
    BigInteger.prototype.abs = function() {
        return new BigInteger(this.value, false);
    };
    SmallInteger.prototype.abs = function() {
        return new SmallInteger(Math.abs(this.value));
    };
    NativeBigInt.prototype.abs = function() {
        return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
    };
    function multiplyLong(a, b) {
        var a_l = a.length, b_l = b.length, l = a_l + b_l, r = createArray(l), base = BASE, product, carry, i, a_i, b_j;
        for(i = 0; i < a_l; ++i){
            a_i = a[i];
            for(var j = 0; j < b_l; ++j){
                b_j = b[j];
                product = a_i * b_j + r[i + j];
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry;
            }
        }
        trim(r);
        return r;
    }
    function multiplySmall(a, b) {
        var l = a.length, r = new Array(l), base = BASE, carry = 0, product, i;
        for(i = 0; i < l; i++){
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base;
        }
        while(carry > 0){
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }
    function shiftLeft(x, n) {
        var r = [];
        while(n-- > 0)r.push(0);
        return r.concat(x);
    }
    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);
        if (n <= 30) return multiplyLong(x, y);
        n = Math.ceil(n / 2);
        var b = x.slice(n), a = x.slice(0, n), d = y.slice(n), c = y.slice(0, n);
        var ac = multiplyKaratsuba(a, c), bd = multiplyKaratsuba(b, d), abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));
        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
        trim(product);
        return product;
    }
    // The following function is derived from a surface fit of a graph plotting the performance difference
    // between long multiplication and karatsuba multiplication versus the lengths of the two arrays.
    function useKaratsuba(l1, l2) {
        return -0.012 * l1 - 0.012 * l2 + 0.000015 * l1 * l2 > 0;
    }
    BigInteger.prototype.multiply = function(v) {
        var n = parseValue(v), a = this.value, b = n.value, sign = this.sign !== n.sign, abs;
        if (n.isSmall) {
            if (b === 0) return Integer[0];
            if (b === 1) return this;
            if (b === -1) return this.negate();
            abs = Math.abs(b);
            if (abs < BASE) {
                return new BigInteger(multiplySmall(a, abs), sign);
            }
            b = smallToArray(abs);
        }
        if (useKaratsuba(a.length, b.length)) return new BigInteger(multiplyKaratsuba(a, b), sign);
        return new BigInteger(multiplyLong(a, b), sign);
    };
    BigInteger.prototype.times = BigInteger.prototype.multiply;
    function multiplySmallAndArray(a, b, sign) {
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }
    SmallInteger.prototype._multiplyBySmall = function(a) {
        if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value);
        }
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };
    BigInteger.prototype._multiplyBySmall = function(a) {
        if (a.value === 0) return Integer[0];
        if (a.value === 1) return this;
        if (a.value === -1) return this.negate();
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };
    SmallInteger.prototype.multiply = function(v) {
        return parseValue(v)._multiplyBySmall(this);
    };
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;
    NativeBigInt.prototype.multiply = function(v) {
        return new NativeBigInt(this.value * parseValue(v).value);
    };
    NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;
    function square(a) {
        //console.assert(2 * BASE * BASE < MAX_INT);
        var l = a.length, r = createArray(l + l), base = BASE, product, carry, i, a_i, a_j;
        for(i = 0; i < l; i++){
            a_i = a[i];
            carry = 0 - a_i * a_i;
            for(var j = i; j < l; j++){
                a_j = a[j];
                product = 2 * (a_i * a_j) + r[i + j] + carry;
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry;
        }
        trim(r);
        return r;
    }
    BigInteger.prototype.square = function() {
        return new BigInteger(square(this.value), false);
    };
    SmallInteger.prototype.square = function() {
        var value = this.value * this.value;
        if (isPrecise(value)) return new SmallInteger(value);
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };
    NativeBigInt.prototype.square = function(v) {
        return new NativeBigInt(this.value * this.value);
    };
    function divMod1(a, b) {
        var a_l = a.length, b_l = b.length, base = BASE, result = createArray(b.length), divisorMostSignificantDigit = b[b_l - 1], // normalization
        lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), remainder = multiplySmall(a, lambda), divisor = multiplySmall(b, lambda), quotientDigit, shift, carry, borrow, i, l, q;
        if (remainder.length <= a_l) remainder.push(0);
        divisor.push(0);
        divisorMostSignificantDigit = divisor[b_l - 1];
        for(shift = a_l - b_l; shift >= 0; shift--){
            quotientDigit = base - 1;
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }
            // quotientDigit <= base - 1
            carry = 0;
            borrow = 0;
            l = divisor.length;
            for(i = 0; i < l; i++){
                carry += quotientDigit * divisor[i];
                q = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base);
                carry = q;
                if (borrow < 0) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0;
                }
            }
            while(borrow !== 0){
                quotientDigit -= 1;
                carry = 0;
                for(i = 0; i < l; i++){
                    carry += remainder[shift + i] - base + divisor[i];
                    if (carry < 0) {
                        remainder[shift + i] = carry + base;
                        carry = 0;
                    } else {
                        remainder[shift + i] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            result[shift] = quotientDigit;
        }
        // denormalization
        remainder = divModSmall(remainder, lambda)[0];
        return [
            arrayToSmall(result),
            arrayToSmall(remainder)
        ];
    }
    function divMod2(a, b) {
        // Performs faster than divMod1 on larger input sizes.
        var a_l = a.length, b_l = b.length, result = [], part = [], base = BASE, guess, xlen, highx, highy, check;
        while(a_l){
            part.unshift(a[--a_l]);
            trim(part);
            if (compareAbs(part, b) < 0) {
                result.push(0);
                continue;
            }
            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];
            if (xlen > b_l) {
                highx = (highx + 1) * base;
            }
            guess = Math.ceil(highx / highy);
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0) break;
                guess--;
            }while (guess)
            result.push(guess);
            part = subtract(part, check);
        }
        result.reverse();
        return [
            arrayToSmall(result),
            arrayToSmall(part)
        ];
    }
    function divModSmall(value, lambda) {
        var length = value.length, quotient = createArray(length), base = BASE, i, q, remainder, divisor;
        remainder = 0;
        for(i = length - 1; i >= 0; --i){
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0;
        }
        return [
            quotient,
            remainder | 0
        ];
    }
    function divModAny(self, v) {
        var value, n = parseValue(v);
        if (supportsNativeBigInt) {
            return [
                new NativeBigInt(self.value / n.value),
                new NativeBigInt(self.value % n.value)
            ];
        }
        var a = self.value, b = n.value;
        var quotient;
        if (b === 0) throw new Error("Cannot divide by zero");
        if (self.isSmall) {
            if (n.isSmall) {
                return [
                    new SmallInteger(truncate(a / b)),
                    new SmallInteger(a % b)
                ];
            }
            return [
                Integer[0],
                self
            ];
        }
        if (n.isSmall) {
            if (b === 1) return [
                self,
                Integer[0]
            ];
            if (b == -1) return [
                self.negate(),
                Integer[0]
            ];
            var abs = Math.abs(b);
            if (abs < BASE) {
                value = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];
                if (self.sign) remainder = -remainder;
                if (typeof quotient === "number") {
                    if (self.sign !== n.sign) quotient = -quotient;
                    return [
                        new SmallInteger(quotient),
                        new SmallInteger(remainder)
                    ];
                }
                return [
                    new BigInteger(quotient, self.sign !== n.sign),
                    new SmallInteger(remainder)
                ];
            }
            b = smallToArray(abs);
        }
        var comparison = compareAbs(a, b);
        if (comparison === -1) return [
            Integer[0],
            self
        ];
        if (comparison === 0) return [
            Integer[self.sign === n.sign ? 1 : -1],
            Integer[0]
        ];
        // divMod1 is faster on smaller input sizes
        if (a.length + b.length <= 200) value = divMod1(a, b);
        else value = divMod2(a, b);
        quotient = value[0];
        var qSign = self.sign !== n.sign, mod = value[1], mSign = self.sign;
        if (typeof quotient === "number") {
            if (qSign) quotient = -quotient;
            quotient = new SmallInteger(quotient);
        } else quotient = new BigInteger(quotient, qSign);
        if (typeof mod === "number") {
            if (mSign) mod = -mod;
            mod = new SmallInteger(mod);
        } else mod = new BigInteger(mod, mSign);
        return [
            quotient,
            mod
        ];
    }
    BigInteger.prototype.divmod = function(v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;
    BigInteger.prototype.divide = function(v) {
        return divModAny(this, v)[0];
    };
    NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function(v) {
        return new NativeBigInt(this.value / parseValue(v).value);
    };
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;
    BigInteger.prototype.mod = function(v) {
        return divModAny(this, v)[1];
    };
    NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function(v) {
        return new NativeBigInt(this.value % parseValue(v).value);
    };
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;
    BigInteger.prototype.pow = function(v) {
        var n = parseValue(v), a = this.value, b = n.value, value, x, y;
        if (b === 0) return Integer[1];
        if (a === 0) return Integer[0];
        if (a === 1) return Integer[1];
        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.sign) {
            return Integer[0];
        }
        if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
        if (this.isSmall) {
            if (isPrecise(value = Math.pow(a, b))) return new SmallInteger(truncate(value));
        }
        x = this;
        y = Integer[1];
        while(true){
            if (b & 1 === 1) {
                y = y.times(x);
                --b;
            }
            if (b === 0) break;
            b /= 2;
            x = x.square();
        }
        return y;
    };
    SmallInteger.prototype.pow = BigInteger.prototype.pow;
    NativeBigInt.prototype.pow = function(v) {
        var n = parseValue(v);
        var a = this.value, b = n.value;
        var _0 = BigInt(0), _1 = BigInt(1), _2 = BigInt(2);
        if (b === _0) return Integer[1];
        if (a === _0) return Integer[0];
        if (a === _1) return Integer[1];
        if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.isNegative()) return new NativeBigInt(_0);
        var x = this;
        var y = Integer[1];
        while(true){
            if ((b & _1) === _1) {
                y = y.times(x);
                --b;
            }
            if (b === _0) break;
            b /= _2;
            x = x.square();
        }
        return y;
    };
    BigInteger.prototype.modPow = function(exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);
        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");
        var r = Integer[1], base = this.mod(mod);
        if (exp.isNegative()) {
            exp = exp.multiply(Integer[-1]);
            base = base.modInv(mod);
        }
        while(exp.isPositive()){
            if (base.isZero()) return Integer[0];
            if (exp.isOdd()) r = r.multiply(base).mod(mod);
            exp = exp.divide(2);
            base = base.square().mod(mod);
        }
        return r;
    };
    NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;
    function compareAbs(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
        }
        for(var i = a.length - 1; i >= 0; i--){
            if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
        }
        return 0;
    }
    BigInteger.prototype.compareAbs = function(v) {
        var n = parseValue(v), a = this.value, b = n.value;
        if (n.isSmall) return 1;
        return compareAbs(a, b);
    };
    SmallInteger.prototype.compareAbs = function(v) {
        var n = parseValue(v), a = Math.abs(this.value), b = n.value;
        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1;
    };
    NativeBigInt.prototype.compareAbs = function(v) {
        var a = this.value;
        var b = parseValue(v).value;
        a = a >= 0 ? a : -a;
        b = b >= 0 ? b : -b;
        return a === b ? 0 : a > b ? 1 : -1;
    };
    BigInteger.prototype.compare = function(v) {
        // See discussion about comparison with Infinity:
        // https://github.com/peterolson/BigInteger.js/issues/61
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }
        var n = parseValue(v), a = this.value, b = n.value;
        if (this.sign !== n.sign) {
            return n.sign ? 1 : -1;
        }
        if (n.isSmall) {
            return this.sign ? -1 : 1;
        }
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;
    SmallInteger.prototype.compare = function(v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }
        var n = parseValue(v), a = this.value, b = n.value;
        if (n.isSmall) {
            return a == b ? 0 : a > b ? 1 : -1;
        }
        if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1;
        }
        return a < 0 ? 1 : -1;
    };
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;
    NativeBigInt.prototype.compare = function(v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }
        var a = this.value;
        var b = parseValue(v).value;
        return a === b ? 0 : a > b ? 1 : -1;
    };
    NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;
    BigInteger.prototype.equals = function(v) {
        return this.compare(v) === 0;
    };
    NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;
    BigInteger.prototype.notEquals = function(v) {
        return this.compare(v) !== 0;
    };
    NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;
    BigInteger.prototype.greater = function(v) {
        return this.compare(v) > 0;
    };
    NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;
    BigInteger.prototype.lesser = function(v) {
        return this.compare(v) < 0;
    };
    NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;
    BigInteger.prototype.greaterOrEquals = function(v) {
        return this.compare(v) >= 0;
    };
    NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;
    BigInteger.prototype.lesserOrEquals = function(v) {
        return this.compare(v) <= 0;
    };
    NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;
    BigInteger.prototype.isEven = function() {
        return (this.value[0] & 1) === 0;
    };
    SmallInteger.prototype.isEven = function() {
        return (this.value & 1) === 0;
    };
    NativeBigInt.prototype.isEven = function() {
        return (this.value & BigInt(1)) === BigInt(0);
    };
    BigInteger.prototype.isOdd = function() {
        return (this.value[0] & 1) === 1;
    };
    SmallInteger.prototype.isOdd = function() {
        return (this.value & 1) === 1;
    };
    NativeBigInt.prototype.isOdd = function() {
        return (this.value & BigInt(1)) === BigInt(1);
    };
    BigInteger.prototype.isPositive = function() {
        return !this.sign;
    };
    SmallInteger.prototype.isPositive = function() {
        return this.value > 0;
    };
    NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive;
    BigInteger.prototype.isNegative = function() {
        return this.sign;
    };
    SmallInteger.prototype.isNegative = function() {
        return this.value < 0;
    };
    NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative;
    BigInteger.prototype.isUnit = function() {
        return false;
    };
    SmallInteger.prototype.isUnit = function() {
        return Math.abs(this.value) === 1;
    };
    NativeBigInt.prototype.isUnit = function() {
        return this.abs().value === BigInt(1);
    };
    BigInteger.prototype.isZero = function() {
        return false;
    };
    SmallInteger.prototype.isZero = function() {
        return this.value === 0;
    };
    NativeBigInt.prototype.isZero = function() {
        return this.value === BigInt(0);
    };
    BigInteger.prototype.isDivisibleBy = function(v) {
        var n = parseValue(v);
        if (n.isZero()) return false;
        if (n.isUnit()) return true;
        if (n.compareAbs(2) === 0) return this.isEven();
        return this.mod(n).isZero();
    };
    NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;
    function isBasicPrime(v) {
        var n = v.abs();
        if (n.isUnit()) return false;
        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
        if (n.lesser(49)) return true;
    // we don't know if it's prime: let the other functions figure it out
    }
    function millerRabinTest(n, a) {
        var nPrev = n.prev(), b = nPrev, r = 0, d, t, i, x;
        while(b.isEven())b = b.divide(2), r++;
        next: for(i = 0; i < a.length; i++){
            if (n.lesser(a[i])) continue;
            x = bigInt(a[i]).modPow(b, n);
            if (x.isUnit() || x.equals(nPrev)) continue;
            for(d = r - 1; d != 0; d--){
                x = x.square().mod(n);
                if (x.isUnit()) return false;
                if (x.equals(nPrev)) continue next;
            }
            return false;
        }
        return true;
    }
    // Set "strict" to true to force GRH-supported lower bound of 2*log(N)^2
    BigInteger.prototype.isPrime = function(strict) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var bits = n.bitLength();
        if (bits <= 64) return millerRabinTest(n, [
            2,
            3,
            5,
            7,
            11,
            13,
            17,
            19,
            23,
            29,
            31,
            37
        ]);
        var logN = Math.log(2) * bits.toJSNumber();
        var t = Math.ceil(strict === true ? 2 * Math.pow(logN, 2) : logN);
        for(var a = [], i = 0; i < t; i++){
            a.push(bigInt(i + 2));
        }
        return millerRabinTest(n, a);
    };
    NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;
    BigInteger.prototype.isProbablePrime = function(iterations, rng) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations;
        for(var a = [], i = 0; i < t; i++){
            a.push(bigInt.randBetween(2, n.minus(2), rng));
        }
        return millerRabinTest(n, a);
    };
    NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;
    BigInteger.prototype.modInv = function(n) {
        var t = bigInt.zero, newT = bigInt.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
        while(!newR.isZero()){
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }
        if (!r.isUnit()) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
        if (t.compare(0) === -1) {
            t = t.add(n);
        }
        if (this.isNegative()) {
            return t.negate();
        }
        return t;
    };
    NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;
    BigInteger.prototype.next = function() {
        var value = this.value;
        if (this.sign) {
            return subtractSmall(value, 1, this.sign);
        }
        return new BigInteger(addSmall(value, 1), this.sign);
    };
    SmallInteger.prototype.next = function() {
        var value = this.value;
        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
        return new BigInteger(MAX_INT_ARR, false);
    };
    NativeBigInt.prototype.next = function() {
        return new NativeBigInt(this.value + BigInt(1));
    };
    BigInteger.prototype.prev = function() {
        var value = this.value;
        if (this.sign) {
            return new BigInteger(addSmall(value, 1), true);
        }
        return subtractSmall(value, 1, this.sign);
    };
    SmallInteger.prototype.prev = function() {
        var value = this.value;
        if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);
        return new BigInteger(MAX_INT_ARR, true);
    };
    NativeBigInt.prototype.prev = function() {
        return new NativeBigInt(this.value - BigInt(1));
    };
    var powersOfTwo = [
        1
    ];
    while(2 * powersOfTwo[powersOfTwo.length - 1] <= BASE)powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];
    function shift_isSmall(n) {
        return Math.abs(n) <= BASE;
    }
    BigInteger.prototype.shiftLeft = function(v) {
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftRight(-n);
        var result = this;
        if (result.isZero()) return result;
        while(n >= powers2Length){
            result = result.multiply(highestPower2);
            n -= powers2Length - 1;
        }
        return result.multiply(powersOfTwo[n]);
    };
    NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;
    BigInteger.prototype.shiftRight = function(v) {
        var remQuo;
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftLeft(-n);
        var result = this;
        while(n >= powers2Length){
            if (result.isZero() || result.isNegative() && result.isUnit()) return result;
            remQuo = divModAny(result, highestPower2);
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1;
        }
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };
    NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;
    function bitwise(x, y, fn) {
        y = parseValue(y);
        var xSign = x.isNegative(), ySign = y.isNegative();
        var xRem = xSign ? x.not() : x, yRem = ySign ? y.not() : y;
        var xDigit = 0, yDigit = 0;
        var xDivMod = null, yDivMod = null;
        var result = [];
        while(!xRem.isZero() || !yRem.isZero()){
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber();
            if (xSign) {
                xDigit = highestPower2 - 1 - xDigit; // two's complement for negative numbers
            }
            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if (ySign) {
                yDigit = highestPower2 - 1 - yDigit; // two's complement for negative numbers
            }
            xRem = xDivMod[0];
            yRem = yDivMod[0];
            result.push(fn(xDigit, yDigit));
        }
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
        for(var i = result.length - 1; i >= 0; i -= 1){
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }
        return sum;
    }
    BigInteger.prototype.not = function() {
        return this.negate().prev();
    };
    NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;
    BigInteger.prototype.and = function(n) {
        return bitwise(this, n, function(a, b) {
            return a & b;
        });
    };
    NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;
    BigInteger.prototype.or = function(n) {
        return bitwise(this, n, function(a, b) {
            return a | b;
        });
    };
    NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;
    BigInteger.prototype.xor = function(n) {
        return bitwise(this, n, function(a, b) {
            return a ^ b;
        });
    };
    NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;
    var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
    function roughLOB(n) {
        // SmallInteger: return Min(lowestOneBit(n), 1 << 30)
        // BigInteger: return Min(lowestOneBit(n), 1 << 14) [BASE=1e7]
        var v = n.value, x = typeof v === "number" ? v | LOBMASK_I : typeof v === "bigint" ? v | BigInt(LOBMASK_I) : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x;
    }
    function integerLogarithm(value, base) {
        if (base.compareTo(value) <= 0) {
            var tmp = integerLogarithm(value, base.square(base));
            var p = tmp.p;
            var e = tmp.e;
            var t = p.multiply(base);
            return t.compareTo(value) <= 0 ? {
                p: t,
                e: e * 2 + 1
            } : {
                p: p,
                e: e * 2
            };
        }
        return {
            p: bigInt(1),
            e: 0
        };
    }
    BigInteger.prototype.bitLength = function() {
        var n = this;
        if (n.compareTo(bigInt(0)) < 0) {
            n = n.negate().subtract(bigInt(1));
        }
        if (n.compareTo(bigInt(0)) === 0) {
            return bigInt(0);
        }
        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
    };
    NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;
    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }
    function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;
        var c = Integer[1], d, t;
        while(a.isEven() && b.isEven()){
            d = min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }
        while(a.isEven()){
            a = a.divide(roughLOB(a));
        }
        do {
            while(b.isEven()){
                b = b.divide(roughLOB(b));
            }
            if (a.greater(b)) {
                t = b;
                b = a;
                a = t;
            }
            b = b.subtract(a);
        }while (!b.isZero())
        return c.isUnit() ? a : a.multiply(c);
    }
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }
    function randBetween(a, b, rng) {
        a = parseValue(a);
        b = parseValue(b);
        var usedRNG = rng || Math.random;
        var low = min(a, b), high = max(a, b);
        var range = high.subtract(low).add(1);
        if (range.isSmall) return low.add(Math.floor(usedRNG() * range));
        var digits = toBase(range, BASE).value;
        var result = [], restricted = true;
        for(var i = 0; i < digits.length; i++){
            var top = restricted ? digits[i] + (i + 1 < digits.length ? digits[i + 1] / BASE : 0) : BASE;
            var digit = truncate(usedRNG() * top);
            result.push(digit);
            if (digit < digits[i]) restricted = false;
        }
        return low.add(Integer.fromArray(result, BASE, false));
    }
    var parseBase = function(text, base, alphabet, caseSensitive) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        text = String(text);
        if (!caseSensitive) {
            text = text.toLowerCase();
            alphabet = alphabet.toLowerCase();
        }
        var length = text.length;
        var i;
        var absBase = Math.abs(base);
        var alphabetValues = {};
        for(i = 0; i < alphabet.length; i++){
            alphabetValues[alphabet[i]] = i;
        }
        for(i = 0; i < length; i++){
            var c = text[i];
            if (c === "-") continue;
            if (c in alphabetValues) {
                if (alphabetValues[c] >= absBase) {
                    if (c === "1" && absBase === 1) continue;
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
            }
        }
        base = parseValue(base);
        var digits = [];
        var isNegative = text[0] === "-";
        for(i = isNegative ? 1 : 0; i < text.length; i++){
            var c = text[i];
            if (c in alphabetValues) digits.push(parseValue(alphabetValues[c]));
            else if (c === "<") {
                var start = i;
                do {
                    i++;
                }while (text[i] !== ">" && i < text.length)
                digits.push(parseValue(text.slice(start + 1, i)));
            } else throw new Error(c + " is not a valid character");
        }
        return parseBaseFromArray(digits, base, isNegative);
    };
    function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0], pow = Integer[1], i;
        for(i = digits.length - 1; i >= 0; i--){
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }
        return isNegative ? val.negate() : val;
    }
    function stringify(digit, alphabet) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        if (digit < alphabet.length) {
            return alphabet[digit];
        }
        return "<" + digit + ">";
    }
    function toBase(n, base) {
        base = bigInt(base);
        if (base.isZero()) {
            if (n.isZero()) return {
                value: [
                    0
                ],
                isNegative: false
            };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (base.equals(-1)) {
            if (n.isZero()) return {
                value: [
                    0
                ],
                isNegative: false
            };
            if (n.isNegative()) return {
                value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber())).map(Array.prototype.valueOf, [
                    1,
                    0
                ])),
                isNegative: false
            };
            var arr = Array.apply(null, Array(n.toJSNumber() - 1)).map(Array.prototype.valueOf, [
                0,
                1
            ]);
            arr.unshift([
                1
            ]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            };
        }
        var neg = false;
        if (n.isNegative() && base.isPositive()) {
            neg = true;
            n = n.abs();
        }
        if (base.isUnit()) {
            if (n.isZero()) return {
                value: [
                    0
                ],
                isNegative: false
            };
            return {
                value: Array.apply(null, Array(n.toJSNumber())).map(Number.prototype.valueOf, 1),
                isNegative: neg
            };
        }
        var out = [];
        var left = n, divmod;
        while(left.isNegative() || left.compareAbs(base) >= 0){
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;
            if (digit.isNegative()) {
                digit = base.minus(digit).abs();
                left = left.next();
            }
            out.push(digit.toJSNumber());
        }
        out.push(left.toJSNumber());
        return {
            value: out.reverse(),
            isNegative: neg
        };
    }
    function toBaseString(n, base, alphabet) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(function(x) {
            return stringify(x, alphabet);
        }).join('');
    }
    BigInteger.prototype.toArray = function(radix) {
        return toBase(this, radix);
    };
    SmallInteger.prototype.toArray = function(radix) {
        return toBase(this, radix);
    };
    NativeBigInt.prototype.toArray = function(radix) {
        return toBase(this, radix);
    };
    BigInteger.prototype.toString = function(radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix !== 10 || alphabet) return toBaseString(this, radix, alphabet);
        var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
        while(--l >= 0){
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
    };
    SmallInteger.prototype.toString = function(radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix != 10 || alphabet) return toBaseString(this, radix, alphabet);
        return String(this.value);
    };
    NativeBigInt.prototype.toString = SmallInteger.prototype.toString;
    NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function() {
        return this.toString();
    };
    BigInteger.prototype.valueOf = function() {
        return parseInt(this.toString(), 10);
    };
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;
    SmallInteger.prototype.valueOf = function() {
        return this.value;
    };
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;
    NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function() {
        return parseInt(this.toString(), 10);
    };
    function parseStringValue(v) {
        if (isPrecise(+v)) {
            var x = +v;
            if (x === truncate(x)) return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
            throw new Error("Invalid integer: " + v);
        }
        var sign = v[0] === "-";
        if (sign) v = v.slice(1);
        var split = v.split(/e/i);
        if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
        if (split.length === 2) {
            var exp = split[1];
            if (exp[0] === "+") exp = exp.slice(1);
            exp = +exp;
            if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
            var text = split[0];
            var decimalPlace = text.indexOf(".");
            if (decimalPlace >= 0) {
                exp -= text.length - decimalPlace - 1;
                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
            }
            if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
            text += new Array(exp + 1).join("0");
            v = text;
        }
        var isValid = /^([0-9][0-9]*)$/.test(v);
        if (!isValid) throw new Error("Invalid integer: " + v);
        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(sign ? "-" + v : v));
        }
        var r = [], max = v.length, l = LOG_BASE, min = max - l;
        while(max > 0){
            r.push(+v.slice(min, max));
            min -= l;
            if (min < 0) min = 0;
            max -= l;
        }
        trim(r);
        return new BigInteger(r, sign);
    }
    function parseNumberValue(v) {
        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(v));
        }
        if (isPrecise(v)) {
            if (v !== truncate(v)) throw new Error(v + " is not an integer.");
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString());
    }
    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v);
        }
        if (typeof v === "string") {
            return parseStringValue(v);
        }
        if (typeof v === "bigint") {
            return new NativeBigInt(v);
        }
        return v;
    }
    // Pre-define numbers in range [-999,999]
    for(var i = 0; i < 1000; i++){
        Integer[i] = parseValue(i);
        if (i > 0) Integer[-i] = parseValue(-i);
    }
    // Backwards compatibility
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;
    Integer.isInstance = function(x) {
        return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt;
    };
    Integer.randBetween = randBetween;
    Integer.fromArray = function(digits, base, isNegative) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };
    return Integer;
}();
// Node.js check
if (("TURBOPACK compile-time value", "object") !== "undefined" && module.hasOwnProperty("exports")) {
    module.exports = bigInt;
}
//amd check
if (typeof define === "function" && define.amd) {
    ((r)=>r !== undefined && __turbopack_context__.v(r))(function() {
        return bigInt;
    }(__turbopack_context__.r, exports, module));
}
}),
"[project]/node_modules/mime/Mime.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * @param typeMap [Object] Map of MIME type -> Array[extensions]
 * @param ...
 */ function Mime() {
    this._types = Object.create(null);
    this._extensions = Object.create(null);
    for(let i = 0; i < arguments.length; i++){
        this.define(arguments[i]);
    }
    this.define = this.define.bind(this);
    this.getType = this.getType.bind(this);
    this.getExtension = this.getExtension.bind(this);
}
/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * If a type declares an extension that has already been defined, an error will
 * be thrown.  To suppress this error and force the extension to be associated
 * with the new type, pass `force`=true.  Alternatively, you may prefix the
 * extension with "*" to map the type to extension, without mapping the
 * extension to the type.
 *
 * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
 *
 *
 * @param map (Object) type definitions
 * @param force (Boolean) if true, force overriding of existing definitions
 */ Mime.prototype.define = function(typeMap, force) {
    for(let type in typeMap){
        let extensions = typeMap[type].map(function(t) {
            return t.toLowerCase();
        });
        type = type.toLowerCase();
        for(let i = 0; i < extensions.length; i++){
            const ext = extensions[i];
            // '*' prefix = not the preferred type for this extension.  So fixup the
            // extension, and skip it.
            if (ext[0] === '*') {
                continue;
            }
            if (!force && ext in this._types) {
                throw new Error('Attempt to change mapping for "' + ext + '" extension from "' + this._types[ext] + '" to "' + type + '". Pass `force=true` to allow this, otherwise remove "' + ext + '" from the list of extensions for "' + type + '".');
            }
            this._types[ext] = type;
        }
        // Use first extension as default
        if (force || !this._extensions[type]) {
            const ext = extensions[0];
            this._extensions[type] = ext[0] !== '*' ? ext : ext.substr(1);
        }
    }
};
/**
 * Lookup a mime type based on extension
 */ Mime.prototype.getType = function(path) {
    path = String(path);
    let last = path.replace(/^.*[/\\]/, '').toLowerCase();
    let ext = last.replace(/^.*\./, '').toLowerCase();
    let hasPath = last.length < path.length;
    let hasDot = ext.length < last.length - 1;
    return (hasDot || !hasPath) && this._types[ext] || null;
};
/**
 * Return file extension associated with a mime type
 */ Mime.prototype.getExtension = function(type) {
    type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
    return type && this._extensions[type.toLowerCase()] || null;
};
module.exports = Mime;
}),
"[project]/node_modules/mime/types/standard.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "application/andrew-inset": [
        "ez"
    ],
    "application/applixware": [
        "aw"
    ],
    "application/atom+xml": [
        "atom"
    ],
    "application/atomcat+xml": [
        "atomcat"
    ],
    "application/atomdeleted+xml": [
        "atomdeleted"
    ],
    "application/atomsvc+xml": [
        "atomsvc"
    ],
    "application/atsc-dwd+xml": [
        "dwd"
    ],
    "application/atsc-held+xml": [
        "held"
    ],
    "application/atsc-rsat+xml": [
        "rsat"
    ],
    "application/bdoc": [
        "bdoc"
    ],
    "application/calendar+xml": [
        "xcs"
    ],
    "application/ccxml+xml": [
        "ccxml"
    ],
    "application/cdfx+xml": [
        "cdfx"
    ],
    "application/cdmi-capability": [
        "cdmia"
    ],
    "application/cdmi-container": [
        "cdmic"
    ],
    "application/cdmi-domain": [
        "cdmid"
    ],
    "application/cdmi-object": [
        "cdmio"
    ],
    "application/cdmi-queue": [
        "cdmiq"
    ],
    "application/cu-seeme": [
        "cu"
    ],
    "application/dash+xml": [
        "mpd"
    ],
    "application/davmount+xml": [
        "davmount"
    ],
    "application/docbook+xml": [
        "dbk"
    ],
    "application/dssc+der": [
        "dssc"
    ],
    "application/dssc+xml": [
        "xdssc"
    ],
    "application/ecmascript": [
        "es",
        "ecma"
    ],
    "application/emma+xml": [
        "emma"
    ],
    "application/emotionml+xml": [
        "emotionml"
    ],
    "application/epub+zip": [
        "epub"
    ],
    "application/exi": [
        "exi"
    ],
    "application/express": [
        "exp"
    ],
    "application/fdt+xml": [
        "fdt"
    ],
    "application/font-tdpfr": [
        "pfr"
    ],
    "application/geo+json": [
        "geojson"
    ],
    "application/gml+xml": [
        "gml"
    ],
    "application/gpx+xml": [
        "gpx"
    ],
    "application/gxf": [
        "gxf"
    ],
    "application/gzip": [
        "gz"
    ],
    "application/hjson": [
        "hjson"
    ],
    "application/hyperstudio": [
        "stk"
    ],
    "application/inkml+xml": [
        "ink",
        "inkml"
    ],
    "application/ipfix": [
        "ipfix"
    ],
    "application/its+xml": [
        "its"
    ],
    "application/java-archive": [
        "jar",
        "war",
        "ear"
    ],
    "application/java-serialized-object": [
        "ser"
    ],
    "application/java-vm": [
        "class"
    ],
    "application/javascript": [
        "js",
        "mjs"
    ],
    "application/json": [
        "json",
        "map"
    ],
    "application/json5": [
        "json5"
    ],
    "application/jsonml+json": [
        "jsonml"
    ],
    "application/ld+json": [
        "jsonld"
    ],
    "application/lgr+xml": [
        "lgr"
    ],
    "application/lost+xml": [
        "lostxml"
    ],
    "application/mac-binhex40": [
        "hqx"
    ],
    "application/mac-compactpro": [
        "cpt"
    ],
    "application/mads+xml": [
        "mads"
    ],
    "application/manifest+json": [
        "webmanifest"
    ],
    "application/marc": [
        "mrc"
    ],
    "application/marcxml+xml": [
        "mrcx"
    ],
    "application/mathematica": [
        "ma",
        "nb",
        "mb"
    ],
    "application/mathml+xml": [
        "mathml"
    ],
    "application/mbox": [
        "mbox"
    ],
    "application/mediaservercontrol+xml": [
        "mscml"
    ],
    "application/metalink+xml": [
        "metalink"
    ],
    "application/metalink4+xml": [
        "meta4"
    ],
    "application/mets+xml": [
        "mets"
    ],
    "application/mmt-aei+xml": [
        "maei"
    ],
    "application/mmt-usd+xml": [
        "musd"
    ],
    "application/mods+xml": [
        "mods"
    ],
    "application/mp21": [
        "m21",
        "mp21"
    ],
    "application/mp4": [
        "mp4s",
        "m4p"
    ],
    "application/msword": [
        "doc",
        "dot"
    ],
    "application/mxf": [
        "mxf"
    ],
    "application/n-quads": [
        "nq"
    ],
    "application/n-triples": [
        "nt"
    ],
    "application/node": [
        "cjs"
    ],
    "application/octet-stream": [
        "bin",
        "dms",
        "lrf",
        "mar",
        "so",
        "dist",
        "distz",
        "pkg",
        "bpk",
        "dump",
        "elc",
        "deploy",
        "exe",
        "dll",
        "deb",
        "dmg",
        "iso",
        "img",
        "msi",
        "msp",
        "msm",
        "buffer"
    ],
    "application/oda": [
        "oda"
    ],
    "application/oebps-package+xml": [
        "opf"
    ],
    "application/ogg": [
        "ogx"
    ],
    "application/omdoc+xml": [
        "omdoc"
    ],
    "application/onenote": [
        "onetoc",
        "onetoc2",
        "onetmp",
        "onepkg"
    ],
    "application/oxps": [
        "oxps"
    ],
    "application/p2p-overlay+xml": [
        "relo"
    ],
    "application/patch-ops-error+xml": [
        "xer"
    ],
    "application/pdf": [
        "pdf"
    ],
    "application/pgp-encrypted": [
        "pgp"
    ],
    "application/pgp-signature": [
        "asc",
        "sig"
    ],
    "application/pics-rules": [
        "prf"
    ],
    "application/pkcs10": [
        "p10"
    ],
    "application/pkcs7-mime": [
        "p7m",
        "p7c"
    ],
    "application/pkcs7-signature": [
        "p7s"
    ],
    "application/pkcs8": [
        "p8"
    ],
    "application/pkix-attr-cert": [
        "ac"
    ],
    "application/pkix-cert": [
        "cer"
    ],
    "application/pkix-crl": [
        "crl"
    ],
    "application/pkix-pkipath": [
        "pkipath"
    ],
    "application/pkixcmp": [
        "pki"
    ],
    "application/pls+xml": [
        "pls"
    ],
    "application/postscript": [
        "ai",
        "eps",
        "ps"
    ],
    "application/provenance+xml": [
        "provx"
    ],
    "application/pskc+xml": [
        "pskcxml"
    ],
    "application/raml+yaml": [
        "raml"
    ],
    "application/rdf+xml": [
        "rdf",
        "owl"
    ],
    "application/reginfo+xml": [
        "rif"
    ],
    "application/relax-ng-compact-syntax": [
        "rnc"
    ],
    "application/resource-lists+xml": [
        "rl"
    ],
    "application/resource-lists-diff+xml": [
        "rld"
    ],
    "application/rls-services+xml": [
        "rs"
    ],
    "application/route-apd+xml": [
        "rapd"
    ],
    "application/route-s-tsid+xml": [
        "sls"
    ],
    "application/route-usd+xml": [
        "rusd"
    ],
    "application/rpki-ghostbusters": [
        "gbr"
    ],
    "application/rpki-manifest": [
        "mft"
    ],
    "application/rpki-roa": [
        "roa"
    ],
    "application/rsd+xml": [
        "rsd"
    ],
    "application/rss+xml": [
        "rss"
    ],
    "application/rtf": [
        "rtf"
    ],
    "application/sbml+xml": [
        "sbml"
    ],
    "application/scvp-cv-request": [
        "scq"
    ],
    "application/scvp-cv-response": [
        "scs"
    ],
    "application/scvp-vp-request": [
        "spq"
    ],
    "application/scvp-vp-response": [
        "spp"
    ],
    "application/sdp": [
        "sdp"
    ],
    "application/senml+xml": [
        "senmlx"
    ],
    "application/sensml+xml": [
        "sensmlx"
    ],
    "application/set-payment-initiation": [
        "setpay"
    ],
    "application/set-registration-initiation": [
        "setreg"
    ],
    "application/shf+xml": [
        "shf"
    ],
    "application/sieve": [
        "siv",
        "sieve"
    ],
    "application/smil+xml": [
        "smi",
        "smil"
    ],
    "application/sparql-query": [
        "rq"
    ],
    "application/sparql-results+xml": [
        "srx"
    ],
    "application/srgs": [
        "gram"
    ],
    "application/srgs+xml": [
        "grxml"
    ],
    "application/sru+xml": [
        "sru"
    ],
    "application/ssdl+xml": [
        "ssdl"
    ],
    "application/ssml+xml": [
        "ssml"
    ],
    "application/swid+xml": [
        "swidtag"
    ],
    "application/tei+xml": [
        "tei",
        "teicorpus"
    ],
    "application/thraud+xml": [
        "tfi"
    ],
    "application/timestamped-data": [
        "tsd"
    ],
    "application/toml": [
        "toml"
    ],
    "application/trig": [
        "trig"
    ],
    "application/ttml+xml": [
        "ttml"
    ],
    "application/ubjson": [
        "ubj"
    ],
    "application/urc-ressheet+xml": [
        "rsheet"
    ],
    "application/urc-targetdesc+xml": [
        "td"
    ],
    "application/voicexml+xml": [
        "vxml"
    ],
    "application/wasm": [
        "wasm"
    ],
    "application/widget": [
        "wgt"
    ],
    "application/winhlp": [
        "hlp"
    ],
    "application/wsdl+xml": [
        "wsdl"
    ],
    "application/wspolicy+xml": [
        "wspolicy"
    ],
    "application/xaml+xml": [
        "xaml"
    ],
    "application/xcap-att+xml": [
        "xav"
    ],
    "application/xcap-caps+xml": [
        "xca"
    ],
    "application/xcap-diff+xml": [
        "xdf"
    ],
    "application/xcap-el+xml": [
        "xel"
    ],
    "application/xcap-ns+xml": [
        "xns"
    ],
    "application/xenc+xml": [
        "xenc"
    ],
    "application/xhtml+xml": [
        "xhtml",
        "xht"
    ],
    "application/xliff+xml": [
        "xlf"
    ],
    "application/xml": [
        "xml",
        "xsl",
        "xsd",
        "rng"
    ],
    "application/xml-dtd": [
        "dtd"
    ],
    "application/xop+xml": [
        "xop"
    ],
    "application/xproc+xml": [
        "xpl"
    ],
    "application/xslt+xml": [
        "*xsl",
        "xslt"
    ],
    "application/xspf+xml": [
        "xspf"
    ],
    "application/xv+xml": [
        "mxml",
        "xhvml",
        "xvml",
        "xvm"
    ],
    "application/yang": [
        "yang"
    ],
    "application/yin+xml": [
        "yin"
    ],
    "application/zip": [
        "zip"
    ],
    "audio/3gpp": [
        "*3gpp"
    ],
    "audio/adpcm": [
        "adp"
    ],
    "audio/amr": [
        "amr"
    ],
    "audio/basic": [
        "au",
        "snd"
    ],
    "audio/midi": [
        "mid",
        "midi",
        "kar",
        "rmi"
    ],
    "audio/mobile-xmf": [
        "mxmf"
    ],
    "audio/mp3": [
        "*mp3"
    ],
    "audio/mp4": [
        "m4a",
        "mp4a"
    ],
    "audio/mpeg": [
        "mpga",
        "mp2",
        "mp2a",
        "mp3",
        "m2a",
        "m3a"
    ],
    "audio/ogg": [
        "oga",
        "ogg",
        "spx",
        "opus"
    ],
    "audio/s3m": [
        "s3m"
    ],
    "audio/silk": [
        "sil"
    ],
    "audio/wav": [
        "wav"
    ],
    "audio/wave": [
        "*wav"
    ],
    "audio/webm": [
        "weba"
    ],
    "audio/xm": [
        "xm"
    ],
    "font/collection": [
        "ttc"
    ],
    "font/otf": [
        "otf"
    ],
    "font/ttf": [
        "ttf"
    ],
    "font/woff": [
        "woff"
    ],
    "font/woff2": [
        "woff2"
    ],
    "image/aces": [
        "exr"
    ],
    "image/apng": [
        "apng"
    ],
    "image/avif": [
        "avif"
    ],
    "image/bmp": [
        "bmp"
    ],
    "image/cgm": [
        "cgm"
    ],
    "image/dicom-rle": [
        "drle"
    ],
    "image/emf": [
        "emf"
    ],
    "image/fits": [
        "fits"
    ],
    "image/g3fax": [
        "g3"
    ],
    "image/gif": [
        "gif"
    ],
    "image/heic": [
        "heic"
    ],
    "image/heic-sequence": [
        "heics"
    ],
    "image/heif": [
        "heif"
    ],
    "image/heif-sequence": [
        "heifs"
    ],
    "image/hej2k": [
        "hej2"
    ],
    "image/hsj2": [
        "hsj2"
    ],
    "image/ief": [
        "ief"
    ],
    "image/jls": [
        "jls"
    ],
    "image/jp2": [
        "jp2",
        "jpg2"
    ],
    "image/jpeg": [
        "jpeg",
        "jpg",
        "jpe"
    ],
    "image/jph": [
        "jph"
    ],
    "image/jphc": [
        "jhc"
    ],
    "image/jpm": [
        "jpm"
    ],
    "image/jpx": [
        "jpx",
        "jpf"
    ],
    "image/jxr": [
        "jxr"
    ],
    "image/jxra": [
        "jxra"
    ],
    "image/jxrs": [
        "jxrs"
    ],
    "image/jxs": [
        "jxs"
    ],
    "image/jxsc": [
        "jxsc"
    ],
    "image/jxsi": [
        "jxsi"
    ],
    "image/jxss": [
        "jxss"
    ],
    "image/ktx": [
        "ktx"
    ],
    "image/ktx2": [
        "ktx2"
    ],
    "image/png": [
        "png"
    ],
    "image/sgi": [
        "sgi"
    ],
    "image/svg+xml": [
        "svg",
        "svgz"
    ],
    "image/t38": [
        "t38"
    ],
    "image/tiff": [
        "tif",
        "tiff"
    ],
    "image/tiff-fx": [
        "tfx"
    ],
    "image/webp": [
        "webp"
    ],
    "image/wmf": [
        "wmf"
    ],
    "message/disposition-notification": [
        "disposition-notification"
    ],
    "message/global": [
        "u8msg"
    ],
    "message/global-delivery-status": [
        "u8dsn"
    ],
    "message/global-disposition-notification": [
        "u8mdn"
    ],
    "message/global-headers": [
        "u8hdr"
    ],
    "message/rfc822": [
        "eml",
        "mime"
    ],
    "model/3mf": [
        "3mf"
    ],
    "model/gltf+json": [
        "gltf"
    ],
    "model/gltf-binary": [
        "glb"
    ],
    "model/iges": [
        "igs",
        "iges"
    ],
    "model/mesh": [
        "msh",
        "mesh",
        "silo"
    ],
    "model/mtl": [
        "mtl"
    ],
    "model/obj": [
        "obj"
    ],
    "model/step+xml": [
        "stpx"
    ],
    "model/step+zip": [
        "stpz"
    ],
    "model/step-xml+zip": [
        "stpxz"
    ],
    "model/stl": [
        "stl"
    ],
    "model/vrml": [
        "wrl",
        "vrml"
    ],
    "model/x3d+binary": [
        "*x3db",
        "x3dbz"
    ],
    "model/x3d+fastinfoset": [
        "x3db"
    ],
    "model/x3d+vrml": [
        "*x3dv",
        "x3dvz"
    ],
    "model/x3d+xml": [
        "x3d",
        "x3dz"
    ],
    "model/x3d-vrml": [
        "x3dv"
    ],
    "text/cache-manifest": [
        "appcache",
        "manifest"
    ],
    "text/calendar": [
        "ics",
        "ifb"
    ],
    "text/coffeescript": [
        "coffee",
        "litcoffee"
    ],
    "text/css": [
        "css"
    ],
    "text/csv": [
        "csv"
    ],
    "text/html": [
        "html",
        "htm",
        "shtml"
    ],
    "text/jade": [
        "jade"
    ],
    "text/jsx": [
        "jsx"
    ],
    "text/less": [
        "less"
    ],
    "text/markdown": [
        "markdown",
        "md"
    ],
    "text/mathml": [
        "mml"
    ],
    "text/mdx": [
        "mdx"
    ],
    "text/n3": [
        "n3"
    ],
    "text/plain": [
        "txt",
        "text",
        "conf",
        "def",
        "list",
        "log",
        "in",
        "ini"
    ],
    "text/richtext": [
        "rtx"
    ],
    "text/rtf": [
        "*rtf"
    ],
    "text/sgml": [
        "sgml",
        "sgm"
    ],
    "text/shex": [
        "shex"
    ],
    "text/slim": [
        "slim",
        "slm"
    ],
    "text/spdx": [
        "spdx"
    ],
    "text/stylus": [
        "stylus",
        "styl"
    ],
    "text/tab-separated-values": [
        "tsv"
    ],
    "text/troff": [
        "t",
        "tr",
        "roff",
        "man",
        "me",
        "ms"
    ],
    "text/turtle": [
        "ttl"
    ],
    "text/uri-list": [
        "uri",
        "uris",
        "urls"
    ],
    "text/vcard": [
        "vcard"
    ],
    "text/vtt": [
        "vtt"
    ],
    "text/xml": [
        "*xml"
    ],
    "text/yaml": [
        "yaml",
        "yml"
    ],
    "video/3gpp": [
        "3gp",
        "3gpp"
    ],
    "video/3gpp2": [
        "3g2"
    ],
    "video/h261": [
        "h261"
    ],
    "video/h263": [
        "h263"
    ],
    "video/h264": [
        "h264"
    ],
    "video/iso.segment": [
        "m4s"
    ],
    "video/jpeg": [
        "jpgv"
    ],
    "video/jpm": [
        "*jpm",
        "jpgm"
    ],
    "video/mj2": [
        "mj2",
        "mjp2"
    ],
    "video/mp2t": [
        "ts"
    ],
    "video/mp4": [
        "mp4",
        "mp4v",
        "mpg4"
    ],
    "video/mpeg": [
        "mpeg",
        "mpg",
        "mpe",
        "m1v",
        "m2v"
    ],
    "video/ogg": [
        "ogv"
    ],
    "video/quicktime": [
        "qt",
        "mov"
    ],
    "video/webm": [
        "webm"
    ]
};
}),
"[project]/node_modules/mime/types/other.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "application/prs.cww": [
        "cww"
    ],
    "application/vnd.1000minds.decision-model+xml": [
        "1km"
    ],
    "application/vnd.3gpp.pic-bw-large": [
        "plb"
    ],
    "application/vnd.3gpp.pic-bw-small": [
        "psb"
    ],
    "application/vnd.3gpp.pic-bw-var": [
        "pvb"
    ],
    "application/vnd.3gpp2.tcap": [
        "tcap"
    ],
    "application/vnd.3m.post-it-notes": [
        "pwn"
    ],
    "application/vnd.accpac.simply.aso": [
        "aso"
    ],
    "application/vnd.accpac.simply.imp": [
        "imp"
    ],
    "application/vnd.acucobol": [
        "acu"
    ],
    "application/vnd.acucorp": [
        "atc",
        "acutc"
    ],
    "application/vnd.adobe.air-application-installer-package+zip": [
        "air"
    ],
    "application/vnd.adobe.formscentral.fcdt": [
        "fcdt"
    ],
    "application/vnd.adobe.fxp": [
        "fxp",
        "fxpl"
    ],
    "application/vnd.adobe.xdp+xml": [
        "xdp"
    ],
    "application/vnd.adobe.xfdf": [
        "xfdf"
    ],
    "application/vnd.ahead.space": [
        "ahead"
    ],
    "application/vnd.airzip.filesecure.azf": [
        "azf"
    ],
    "application/vnd.airzip.filesecure.azs": [
        "azs"
    ],
    "application/vnd.amazon.ebook": [
        "azw"
    ],
    "application/vnd.americandynamics.acc": [
        "acc"
    ],
    "application/vnd.amiga.ami": [
        "ami"
    ],
    "application/vnd.android.package-archive": [
        "apk"
    ],
    "application/vnd.anser-web-certificate-issue-initiation": [
        "cii"
    ],
    "application/vnd.anser-web-funds-transfer-initiation": [
        "fti"
    ],
    "application/vnd.antix.game-component": [
        "atx"
    ],
    "application/vnd.apple.installer+xml": [
        "mpkg"
    ],
    "application/vnd.apple.keynote": [
        "key"
    ],
    "application/vnd.apple.mpegurl": [
        "m3u8"
    ],
    "application/vnd.apple.numbers": [
        "numbers"
    ],
    "application/vnd.apple.pages": [
        "pages"
    ],
    "application/vnd.apple.pkpass": [
        "pkpass"
    ],
    "application/vnd.aristanetworks.swi": [
        "swi"
    ],
    "application/vnd.astraea-software.iota": [
        "iota"
    ],
    "application/vnd.audiograph": [
        "aep"
    ],
    "application/vnd.balsamiq.bmml+xml": [
        "bmml"
    ],
    "application/vnd.blueice.multipass": [
        "mpm"
    ],
    "application/vnd.bmi": [
        "bmi"
    ],
    "application/vnd.businessobjects": [
        "rep"
    ],
    "application/vnd.chemdraw+xml": [
        "cdxml"
    ],
    "application/vnd.chipnuts.karaoke-mmd": [
        "mmd"
    ],
    "application/vnd.cinderella": [
        "cdy"
    ],
    "application/vnd.citationstyles.style+xml": [
        "csl"
    ],
    "application/vnd.claymore": [
        "cla"
    ],
    "application/vnd.cloanto.rp9": [
        "rp9"
    ],
    "application/vnd.clonk.c4group": [
        "c4g",
        "c4d",
        "c4f",
        "c4p",
        "c4u"
    ],
    "application/vnd.cluetrust.cartomobile-config": [
        "c11amc"
    ],
    "application/vnd.cluetrust.cartomobile-config-pkg": [
        "c11amz"
    ],
    "application/vnd.commonspace": [
        "csp"
    ],
    "application/vnd.contact.cmsg": [
        "cdbcmsg"
    ],
    "application/vnd.cosmocaller": [
        "cmc"
    ],
    "application/vnd.crick.clicker": [
        "clkx"
    ],
    "application/vnd.crick.clicker.keyboard": [
        "clkk"
    ],
    "application/vnd.crick.clicker.palette": [
        "clkp"
    ],
    "application/vnd.crick.clicker.template": [
        "clkt"
    ],
    "application/vnd.crick.clicker.wordbank": [
        "clkw"
    ],
    "application/vnd.criticaltools.wbs+xml": [
        "wbs"
    ],
    "application/vnd.ctc-posml": [
        "pml"
    ],
    "application/vnd.cups-ppd": [
        "ppd"
    ],
    "application/vnd.curl.car": [
        "car"
    ],
    "application/vnd.curl.pcurl": [
        "pcurl"
    ],
    "application/vnd.dart": [
        "dart"
    ],
    "application/vnd.data-vision.rdz": [
        "rdz"
    ],
    "application/vnd.dbf": [
        "dbf"
    ],
    "application/vnd.dece.data": [
        "uvf",
        "uvvf",
        "uvd",
        "uvvd"
    ],
    "application/vnd.dece.ttml+xml": [
        "uvt",
        "uvvt"
    ],
    "application/vnd.dece.unspecified": [
        "uvx",
        "uvvx"
    ],
    "application/vnd.dece.zip": [
        "uvz",
        "uvvz"
    ],
    "application/vnd.denovo.fcselayout-link": [
        "fe_launch"
    ],
    "application/vnd.dna": [
        "dna"
    ],
    "application/vnd.dolby.mlp": [
        "mlp"
    ],
    "application/vnd.dpgraph": [
        "dpg"
    ],
    "application/vnd.dreamfactory": [
        "dfac"
    ],
    "application/vnd.ds-keypoint": [
        "kpxx"
    ],
    "application/vnd.dvb.ait": [
        "ait"
    ],
    "application/vnd.dvb.service": [
        "svc"
    ],
    "application/vnd.dynageo": [
        "geo"
    ],
    "application/vnd.ecowin.chart": [
        "mag"
    ],
    "application/vnd.enliven": [
        "nml"
    ],
    "application/vnd.epson.esf": [
        "esf"
    ],
    "application/vnd.epson.msf": [
        "msf"
    ],
    "application/vnd.epson.quickanime": [
        "qam"
    ],
    "application/vnd.epson.salt": [
        "slt"
    ],
    "application/vnd.epson.ssf": [
        "ssf"
    ],
    "application/vnd.eszigno3+xml": [
        "es3",
        "et3"
    ],
    "application/vnd.ezpix-album": [
        "ez2"
    ],
    "application/vnd.ezpix-package": [
        "ez3"
    ],
    "application/vnd.fdf": [
        "fdf"
    ],
    "application/vnd.fdsn.mseed": [
        "mseed"
    ],
    "application/vnd.fdsn.seed": [
        "seed",
        "dataless"
    ],
    "application/vnd.flographit": [
        "gph"
    ],
    "application/vnd.fluxtime.clip": [
        "ftc"
    ],
    "application/vnd.framemaker": [
        "fm",
        "frame",
        "maker",
        "book"
    ],
    "application/vnd.frogans.fnc": [
        "fnc"
    ],
    "application/vnd.frogans.ltf": [
        "ltf"
    ],
    "application/vnd.fsc.weblaunch": [
        "fsc"
    ],
    "application/vnd.fujitsu.oasys": [
        "oas"
    ],
    "application/vnd.fujitsu.oasys2": [
        "oa2"
    ],
    "application/vnd.fujitsu.oasys3": [
        "oa3"
    ],
    "application/vnd.fujitsu.oasysgp": [
        "fg5"
    ],
    "application/vnd.fujitsu.oasysprs": [
        "bh2"
    ],
    "application/vnd.fujixerox.ddd": [
        "ddd"
    ],
    "application/vnd.fujixerox.docuworks": [
        "xdw"
    ],
    "application/vnd.fujixerox.docuworks.binder": [
        "xbd"
    ],
    "application/vnd.fuzzysheet": [
        "fzs"
    ],
    "application/vnd.genomatix.tuxedo": [
        "txd"
    ],
    "application/vnd.geogebra.file": [
        "ggb"
    ],
    "application/vnd.geogebra.tool": [
        "ggt"
    ],
    "application/vnd.geometry-explorer": [
        "gex",
        "gre"
    ],
    "application/vnd.geonext": [
        "gxt"
    ],
    "application/vnd.geoplan": [
        "g2w"
    ],
    "application/vnd.geospace": [
        "g3w"
    ],
    "application/vnd.gmx": [
        "gmx"
    ],
    "application/vnd.google-apps.document": [
        "gdoc"
    ],
    "application/vnd.google-apps.presentation": [
        "gslides"
    ],
    "application/vnd.google-apps.spreadsheet": [
        "gsheet"
    ],
    "application/vnd.google-earth.kml+xml": [
        "kml"
    ],
    "application/vnd.google-earth.kmz": [
        "kmz"
    ],
    "application/vnd.grafeq": [
        "gqf",
        "gqs"
    ],
    "application/vnd.groove-account": [
        "gac"
    ],
    "application/vnd.groove-help": [
        "ghf"
    ],
    "application/vnd.groove-identity-message": [
        "gim"
    ],
    "application/vnd.groove-injector": [
        "grv"
    ],
    "application/vnd.groove-tool-message": [
        "gtm"
    ],
    "application/vnd.groove-tool-template": [
        "tpl"
    ],
    "application/vnd.groove-vcard": [
        "vcg"
    ],
    "application/vnd.hal+xml": [
        "hal"
    ],
    "application/vnd.handheld-entertainment+xml": [
        "zmm"
    ],
    "application/vnd.hbci": [
        "hbci"
    ],
    "application/vnd.hhe.lesson-player": [
        "les"
    ],
    "application/vnd.hp-hpgl": [
        "hpgl"
    ],
    "application/vnd.hp-hpid": [
        "hpid"
    ],
    "application/vnd.hp-hps": [
        "hps"
    ],
    "application/vnd.hp-jlyt": [
        "jlt"
    ],
    "application/vnd.hp-pcl": [
        "pcl"
    ],
    "application/vnd.hp-pclxl": [
        "pclxl"
    ],
    "application/vnd.hydrostatix.sof-data": [
        "sfd-hdstx"
    ],
    "application/vnd.ibm.minipay": [
        "mpy"
    ],
    "application/vnd.ibm.modcap": [
        "afp",
        "listafp",
        "list3820"
    ],
    "application/vnd.ibm.rights-management": [
        "irm"
    ],
    "application/vnd.ibm.secure-container": [
        "sc"
    ],
    "application/vnd.iccprofile": [
        "icc",
        "icm"
    ],
    "application/vnd.igloader": [
        "igl"
    ],
    "application/vnd.immervision-ivp": [
        "ivp"
    ],
    "application/vnd.immervision-ivu": [
        "ivu"
    ],
    "application/vnd.insors.igm": [
        "igm"
    ],
    "application/vnd.intercon.formnet": [
        "xpw",
        "xpx"
    ],
    "application/vnd.intergeo": [
        "i2g"
    ],
    "application/vnd.intu.qbo": [
        "qbo"
    ],
    "application/vnd.intu.qfx": [
        "qfx"
    ],
    "application/vnd.ipunplugged.rcprofile": [
        "rcprofile"
    ],
    "application/vnd.irepository.package+xml": [
        "irp"
    ],
    "application/vnd.is-xpr": [
        "xpr"
    ],
    "application/vnd.isac.fcs": [
        "fcs"
    ],
    "application/vnd.jam": [
        "jam"
    ],
    "application/vnd.jcp.javame.midlet-rms": [
        "rms"
    ],
    "application/vnd.jisp": [
        "jisp"
    ],
    "application/vnd.joost.joda-archive": [
        "joda"
    ],
    "application/vnd.kahootz": [
        "ktz",
        "ktr"
    ],
    "application/vnd.kde.karbon": [
        "karbon"
    ],
    "application/vnd.kde.kchart": [
        "chrt"
    ],
    "application/vnd.kde.kformula": [
        "kfo"
    ],
    "application/vnd.kde.kivio": [
        "flw"
    ],
    "application/vnd.kde.kontour": [
        "kon"
    ],
    "application/vnd.kde.kpresenter": [
        "kpr",
        "kpt"
    ],
    "application/vnd.kde.kspread": [
        "ksp"
    ],
    "application/vnd.kde.kword": [
        "kwd",
        "kwt"
    ],
    "application/vnd.kenameaapp": [
        "htke"
    ],
    "application/vnd.kidspiration": [
        "kia"
    ],
    "application/vnd.kinar": [
        "kne",
        "knp"
    ],
    "application/vnd.koan": [
        "skp",
        "skd",
        "skt",
        "skm"
    ],
    "application/vnd.kodak-descriptor": [
        "sse"
    ],
    "application/vnd.las.las+xml": [
        "lasxml"
    ],
    "application/vnd.llamagraphics.life-balance.desktop": [
        "lbd"
    ],
    "application/vnd.llamagraphics.life-balance.exchange+xml": [
        "lbe"
    ],
    "application/vnd.lotus-1-2-3": [
        "123"
    ],
    "application/vnd.lotus-approach": [
        "apr"
    ],
    "application/vnd.lotus-freelance": [
        "pre"
    ],
    "application/vnd.lotus-notes": [
        "nsf"
    ],
    "application/vnd.lotus-organizer": [
        "org"
    ],
    "application/vnd.lotus-screencam": [
        "scm"
    ],
    "application/vnd.lotus-wordpro": [
        "lwp"
    ],
    "application/vnd.macports.portpkg": [
        "portpkg"
    ],
    "application/vnd.mapbox-vector-tile": [
        "mvt"
    ],
    "application/vnd.mcd": [
        "mcd"
    ],
    "application/vnd.medcalcdata": [
        "mc1"
    ],
    "application/vnd.mediastation.cdkey": [
        "cdkey"
    ],
    "application/vnd.mfer": [
        "mwf"
    ],
    "application/vnd.mfmp": [
        "mfm"
    ],
    "application/vnd.micrografx.flo": [
        "flo"
    ],
    "application/vnd.micrografx.igx": [
        "igx"
    ],
    "application/vnd.mif": [
        "mif"
    ],
    "application/vnd.mobius.daf": [
        "daf"
    ],
    "application/vnd.mobius.dis": [
        "dis"
    ],
    "application/vnd.mobius.mbk": [
        "mbk"
    ],
    "application/vnd.mobius.mqy": [
        "mqy"
    ],
    "application/vnd.mobius.msl": [
        "msl"
    ],
    "application/vnd.mobius.plc": [
        "plc"
    ],
    "application/vnd.mobius.txf": [
        "txf"
    ],
    "application/vnd.mophun.application": [
        "mpn"
    ],
    "application/vnd.mophun.certificate": [
        "mpc"
    ],
    "application/vnd.mozilla.xul+xml": [
        "xul"
    ],
    "application/vnd.ms-artgalry": [
        "cil"
    ],
    "application/vnd.ms-cab-compressed": [
        "cab"
    ],
    "application/vnd.ms-excel": [
        "xls",
        "xlm",
        "xla",
        "xlc",
        "xlt",
        "xlw"
    ],
    "application/vnd.ms-excel.addin.macroenabled.12": [
        "xlam"
    ],
    "application/vnd.ms-excel.sheet.binary.macroenabled.12": [
        "xlsb"
    ],
    "application/vnd.ms-excel.sheet.macroenabled.12": [
        "xlsm"
    ],
    "application/vnd.ms-excel.template.macroenabled.12": [
        "xltm"
    ],
    "application/vnd.ms-fontobject": [
        "eot"
    ],
    "application/vnd.ms-htmlhelp": [
        "chm"
    ],
    "application/vnd.ms-ims": [
        "ims"
    ],
    "application/vnd.ms-lrm": [
        "lrm"
    ],
    "application/vnd.ms-officetheme": [
        "thmx"
    ],
    "application/vnd.ms-outlook": [
        "msg"
    ],
    "application/vnd.ms-pki.seccat": [
        "cat"
    ],
    "application/vnd.ms-pki.stl": [
        "*stl"
    ],
    "application/vnd.ms-powerpoint": [
        "ppt",
        "pps",
        "pot"
    ],
    "application/vnd.ms-powerpoint.addin.macroenabled.12": [
        "ppam"
    ],
    "application/vnd.ms-powerpoint.presentation.macroenabled.12": [
        "pptm"
    ],
    "application/vnd.ms-powerpoint.slide.macroenabled.12": [
        "sldm"
    ],
    "application/vnd.ms-powerpoint.slideshow.macroenabled.12": [
        "ppsm"
    ],
    "application/vnd.ms-powerpoint.template.macroenabled.12": [
        "potm"
    ],
    "application/vnd.ms-project": [
        "mpp",
        "mpt"
    ],
    "application/vnd.ms-word.document.macroenabled.12": [
        "docm"
    ],
    "application/vnd.ms-word.template.macroenabled.12": [
        "dotm"
    ],
    "application/vnd.ms-works": [
        "wps",
        "wks",
        "wcm",
        "wdb"
    ],
    "application/vnd.ms-wpl": [
        "wpl"
    ],
    "application/vnd.ms-xpsdocument": [
        "xps"
    ],
    "application/vnd.mseq": [
        "mseq"
    ],
    "application/vnd.musician": [
        "mus"
    ],
    "application/vnd.muvee.style": [
        "msty"
    ],
    "application/vnd.mynfc": [
        "taglet"
    ],
    "application/vnd.neurolanguage.nlu": [
        "nlu"
    ],
    "application/vnd.nitf": [
        "ntf",
        "nitf"
    ],
    "application/vnd.noblenet-directory": [
        "nnd"
    ],
    "application/vnd.noblenet-sealer": [
        "nns"
    ],
    "application/vnd.noblenet-web": [
        "nnw"
    ],
    "application/vnd.nokia.n-gage.ac+xml": [
        "*ac"
    ],
    "application/vnd.nokia.n-gage.data": [
        "ngdat"
    ],
    "application/vnd.nokia.n-gage.symbian.install": [
        "n-gage"
    ],
    "application/vnd.nokia.radio-preset": [
        "rpst"
    ],
    "application/vnd.nokia.radio-presets": [
        "rpss"
    ],
    "application/vnd.novadigm.edm": [
        "edm"
    ],
    "application/vnd.novadigm.edx": [
        "edx"
    ],
    "application/vnd.novadigm.ext": [
        "ext"
    ],
    "application/vnd.oasis.opendocument.chart": [
        "odc"
    ],
    "application/vnd.oasis.opendocument.chart-template": [
        "otc"
    ],
    "application/vnd.oasis.opendocument.database": [
        "odb"
    ],
    "application/vnd.oasis.opendocument.formula": [
        "odf"
    ],
    "application/vnd.oasis.opendocument.formula-template": [
        "odft"
    ],
    "application/vnd.oasis.opendocument.graphics": [
        "odg"
    ],
    "application/vnd.oasis.opendocument.graphics-template": [
        "otg"
    ],
    "application/vnd.oasis.opendocument.image": [
        "odi"
    ],
    "application/vnd.oasis.opendocument.image-template": [
        "oti"
    ],
    "application/vnd.oasis.opendocument.presentation": [
        "odp"
    ],
    "application/vnd.oasis.opendocument.presentation-template": [
        "otp"
    ],
    "application/vnd.oasis.opendocument.spreadsheet": [
        "ods"
    ],
    "application/vnd.oasis.opendocument.spreadsheet-template": [
        "ots"
    ],
    "application/vnd.oasis.opendocument.text": [
        "odt"
    ],
    "application/vnd.oasis.opendocument.text-master": [
        "odm"
    ],
    "application/vnd.oasis.opendocument.text-template": [
        "ott"
    ],
    "application/vnd.oasis.opendocument.text-web": [
        "oth"
    ],
    "application/vnd.olpc-sugar": [
        "xo"
    ],
    "application/vnd.oma.dd2+xml": [
        "dd2"
    ],
    "application/vnd.openblox.game+xml": [
        "obgx"
    ],
    "application/vnd.openofficeorg.extension": [
        "oxt"
    ],
    "application/vnd.openstreetmap.data+xml": [
        "osm"
    ],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
        "pptx"
    ],
    "application/vnd.openxmlformats-officedocument.presentationml.slide": [
        "sldx"
    ],
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow": [
        "ppsx"
    ],
    "application/vnd.openxmlformats-officedocument.presentationml.template": [
        "potx"
    ],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        "xlsx"
    ],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template": [
        "xltx"
    ],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        "docx"
    ],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template": [
        "dotx"
    ],
    "application/vnd.osgeo.mapguide.package": [
        "mgp"
    ],
    "application/vnd.osgi.dp": [
        "dp"
    ],
    "application/vnd.osgi.subsystem": [
        "esa"
    ],
    "application/vnd.palm": [
        "pdb",
        "pqa",
        "oprc"
    ],
    "application/vnd.pawaafile": [
        "paw"
    ],
    "application/vnd.pg.format": [
        "str"
    ],
    "application/vnd.pg.osasli": [
        "ei6"
    ],
    "application/vnd.picsel": [
        "efif"
    ],
    "application/vnd.pmi.widget": [
        "wg"
    ],
    "application/vnd.pocketlearn": [
        "plf"
    ],
    "application/vnd.powerbuilder6": [
        "pbd"
    ],
    "application/vnd.previewsystems.box": [
        "box"
    ],
    "application/vnd.proteus.magazine": [
        "mgz"
    ],
    "application/vnd.publishare-delta-tree": [
        "qps"
    ],
    "application/vnd.pvi.ptid1": [
        "ptid"
    ],
    "application/vnd.quark.quarkxpress": [
        "qxd",
        "qxt",
        "qwd",
        "qwt",
        "qxl",
        "qxb"
    ],
    "application/vnd.rar": [
        "rar"
    ],
    "application/vnd.realvnc.bed": [
        "bed"
    ],
    "application/vnd.recordare.musicxml": [
        "mxl"
    ],
    "application/vnd.recordare.musicxml+xml": [
        "musicxml"
    ],
    "application/vnd.rig.cryptonote": [
        "cryptonote"
    ],
    "application/vnd.rim.cod": [
        "cod"
    ],
    "application/vnd.rn-realmedia": [
        "rm"
    ],
    "application/vnd.rn-realmedia-vbr": [
        "rmvb"
    ],
    "application/vnd.route66.link66+xml": [
        "link66"
    ],
    "application/vnd.sailingtracker.track": [
        "st"
    ],
    "application/vnd.seemail": [
        "see"
    ],
    "application/vnd.sema": [
        "sema"
    ],
    "application/vnd.semd": [
        "semd"
    ],
    "application/vnd.semf": [
        "semf"
    ],
    "application/vnd.shana.informed.formdata": [
        "ifm"
    ],
    "application/vnd.shana.informed.formtemplate": [
        "itp"
    ],
    "application/vnd.shana.informed.interchange": [
        "iif"
    ],
    "application/vnd.shana.informed.package": [
        "ipk"
    ],
    "application/vnd.simtech-mindmapper": [
        "twd",
        "twds"
    ],
    "application/vnd.smaf": [
        "mmf"
    ],
    "application/vnd.smart.teacher": [
        "teacher"
    ],
    "application/vnd.software602.filler.form+xml": [
        "fo"
    ],
    "application/vnd.solent.sdkm+xml": [
        "sdkm",
        "sdkd"
    ],
    "application/vnd.spotfire.dxp": [
        "dxp"
    ],
    "application/vnd.spotfire.sfs": [
        "sfs"
    ],
    "application/vnd.stardivision.calc": [
        "sdc"
    ],
    "application/vnd.stardivision.draw": [
        "sda"
    ],
    "application/vnd.stardivision.impress": [
        "sdd"
    ],
    "application/vnd.stardivision.math": [
        "smf"
    ],
    "application/vnd.stardivision.writer": [
        "sdw",
        "vor"
    ],
    "application/vnd.stardivision.writer-global": [
        "sgl"
    ],
    "application/vnd.stepmania.package": [
        "smzip"
    ],
    "application/vnd.stepmania.stepchart": [
        "sm"
    ],
    "application/vnd.sun.wadl+xml": [
        "wadl"
    ],
    "application/vnd.sun.xml.calc": [
        "sxc"
    ],
    "application/vnd.sun.xml.calc.template": [
        "stc"
    ],
    "application/vnd.sun.xml.draw": [
        "sxd"
    ],
    "application/vnd.sun.xml.draw.template": [
        "std"
    ],
    "application/vnd.sun.xml.impress": [
        "sxi"
    ],
    "application/vnd.sun.xml.impress.template": [
        "sti"
    ],
    "application/vnd.sun.xml.math": [
        "sxm"
    ],
    "application/vnd.sun.xml.writer": [
        "sxw"
    ],
    "application/vnd.sun.xml.writer.global": [
        "sxg"
    ],
    "application/vnd.sun.xml.writer.template": [
        "stw"
    ],
    "application/vnd.sus-calendar": [
        "sus",
        "susp"
    ],
    "application/vnd.svd": [
        "svd"
    ],
    "application/vnd.symbian.install": [
        "sis",
        "sisx"
    ],
    "application/vnd.syncml+xml": [
        "xsm"
    ],
    "application/vnd.syncml.dm+wbxml": [
        "bdm"
    ],
    "application/vnd.syncml.dm+xml": [
        "xdm"
    ],
    "application/vnd.syncml.dmddf+xml": [
        "ddf"
    ],
    "application/vnd.tao.intent-module-archive": [
        "tao"
    ],
    "application/vnd.tcpdump.pcap": [
        "pcap",
        "cap",
        "dmp"
    ],
    "application/vnd.tmobile-livetv": [
        "tmo"
    ],
    "application/vnd.trid.tpt": [
        "tpt"
    ],
    "application/vnd.triscape.mxs": [
        "mxs"
    ],
    "application/vnd.trueapp": [
        "tra"
    ],
    "application/vnd.ufdl": [
        "ufd",
        "ufdl"
    ],
    "application/vnd.uiq.theme": [
        "utz"
    ],
    "application/vnd.umajin": [
        "umj"
    ],
    "application/vnd.unity": [
        "unityweb"
    ],
    "application/vnd.uoml+xml": [
        "uoml"
    ],
    "application/vnd.vcx": [
        "vcx"
    ],
    "application/vnd.visio": [
        "vsd",
        "vst",
        "vss",
        "vsw"
    ],
    "application/vnd.visionary": [
        "vis"
    ],
    "application/vnd.vsf": [
        "vsf"
    ],
    "application/vnd.wap.wbxml": [
        "wbxml"
    ],
    "application/vnd.wap.wmlc": [
        "wmlc"
    ],
    "application/vnd.wap.wmlscriptc": [
        "wmlsc"
    ],
    "application/vnd.webturbo": [
        "wtb"
    ],
    "application/vnd.wolfram.player": [
        "nbp"
    ],
    "application/vnd.wordperfect": [
        "wpd"
    ],
    "application/vnd.wqd": [
        "wqd"
    ],
    "application/vnd.wt.stf": [
        "stf"
    ],
    "application/vnd.xara": [
        "xar"
    ],
    "application/vnd.xfdl": [
        "xfdl"
    ],
    "application/vnd.yamaha.hv-dic": [
        "hvd"
    ],
    "application/vnd.yamaha.hv-script": [
        "hvs"
    ],
    "application/vnd.yamaha.hv-voice": [
        "hvp"
    ],
    "application/vnd.yamaha.openscoreformat": [
        "osf"
    ],
    "application/vnd.yamaha.openscoreformat.osfpvg+xml": [
        "osfpvg"
    ],
    "application/vnd.yamaha.smaf-audio": [
        "saf"
    ],
    "application/vnd.yamaha.smaf-phrase": [
        "spf"
    ],
    "application/vnd.yellowriver-custom-menu": [
        "cmp"
    ],
    "application/vnd.zul": [
        "zir",
        "zirz"
    ],
    "application/vnd.zzazz.deck+xml": [
        "zaz"
    ],
    "application/x-7z-compressed": [
        "7z"
    ],
    "application/x-abiword": [
        "abw"
    ],
    "application/x-ace-compressed": [
        "ace"
    ],
    "application/x-apple-diskimage": [
        "*dmg"
    ],
    "application/x-arj": [
        "arj"
    ],
    "application/x-authorware-bin": [
        "aab",
        "x32",
        "u32",
        "vox"
    ],
    "application/x-authorware-map": [
        "aam"
    ],
    "application/x-authorware-seg": [
        "aas"
    ],
    "application/x-bcpio": [
        "bcpio"
    ],
    "application/x-bdoc": [
        "*bdoc"
    ],
    "application/x-bittorrent": [
        "torrent"
    ],
    "application/x-blorb": [
        "blb",
        "blorb"
    ],
    "application/x-bzip": [
        "bz"
    ],
    "application/x-bzip2": [
        "bz2",
        "boz"
    ],
    "application/x-cbr": [
        "cbr",
        "cba",
        "cbt",
        "cbz",
        "cb7"
    ],
    "application/x-cdlink": [
        "vcd"
    ],
    "application/x-cfs-compressed": [
        "cfs"
    ],
    "application/x-chat": [
        "chat"
    ],
    "application/x-chess-pgn": [
        "pgn"
    ],
    "application/x-chrome-extension": [
        "crx"
    ],
    "application/x-cocoa": [
        "cco"
    ],
    "application/x-conference": [
        "nsc"
    ],
    "application/x-cpio": [
        "cpio"
    ],
    "application/x-csh": [
        "csh"
    ],
    "application/x-debian-package": [
        "*deb",
        "udeb"
    ],
    "application/x-dgc-compressed": [
        "dgc"
    ],
    "application/x-director": [
        "dir",
        "dcr",
        "dxr",
        "cst",
        "cct",
        "cxt",
        "w3d",
        "fgd",
        "swa"
    ],
    "application/x-doom": [
        "wad"
    ],
    "application/x-dtbncx+xml": [
        "ncx"
    ],
    "application/x-dtbook+xml": [
        "dtb"
    ],
    "application/x-dtbresource+xml": [
        "res"
    ],
    "application/x-dvi": [
        "dvi"
    ],
    "application/x-envoy": [
        "evy"
    ],
    "application/x-eva": [
        "eva"
    ],
    "application/x-font-bdf": [
        "bdf"
    ],
    "application/x-font-ghostscript": [
        "gsf"
    ],
    "application/x-font-linux-psf": [
        "psf"
    ],
    "application/x-font-pcf": [
        "pcf"
    ],
    "application/x-font-snf": [
        "snf"
    ],
    "application/x-font-type1": [
        "pfa",
        "pfb",
        "pfm",
        "afm"
    ],
    "application/x-freearc": [
        "arc"
    ],
    "application/x-futuresplash": [
        "spl"
    ],
    "application/x-gca-compressed": [
        "gca"
    ],
    "application/x-glulx": [
        "ulx"
    ],
    "application/x-gnumeric": [
        "gnumeric"
    ],
    "application/x-gramps-xml": [
        "gramps"
    ],
    "application/x-gtar": [
        "gtar"
    ],
    "application/x-hdf": [
        "hdf"
    ],
    "application/x-httpd-php": [
        "php"
    ],
    "application/x-install-instructions": [
        "install"
    ],
    "application/x-iso9660-image": [
        "*iso"
    ],
    "application/x-iwork-keynote-sffkey": [
        "*key"
    ],
    "application/x-iwork-numbers-sffnumbers": [
        "*numbers"
    ],
    "application/x-iwork-pages-sffpages": [
        "*pages"
    ],
    "application/x-java-archive-diff": [
        "jardiff"
    ],
    "application/x-java-jnlp-file": [
        "jnlp"
    ],
    "application/x-keepass2": [
        "kdbx"
    ],
    "application/x-latex": [
        "latex"
    ],
    "application/x-lua-bytecode": [
        "luac"
    ],
    "application/x-lzh-compressed": [
        "lzh",
        "lha"
    ],
    "application/x-makeself": [
        "run"
    ],
    "application/x-mie": [
        "mie"
    ],
    "application/x-mobipocket-ebook": [
        "prc",
        "mobi"
    ],
    "application/x-ms-application": [
        "application"
    ],
    "application/x-ms-shortcut": [
        "lnk"
    ],
    "application/x-ms-wmd": [
        "wmd"
    ],
    "application/x-ms-wmz": [
        "wmz"
    ],
    "application/x-ms-xbap": [
        "xbap"
    ],
    "application/x-msaccess": [
        "mdb"
    ],
    "application/x-msbinder": [
        "obd"
    ],
    "application/x-mscardfile": [
        "crd"
    ],
    "application/x-msclip": [
        "clp"
    ],
    "application/x-msdos-program": [
        "*exe"
    ],
    "application/x-msdownload": [
        "*exe",
        "*dll",
        "com",
        "bat",
        "*msi"
    ],
    "application/x-msmediaview": [
        "mvb",
        "m13",
        "m14"
    ],
    "application/x-msmetafile": [
        "*wmf",
        "*wmz",
        "*emf",
        "emz"
    ],
    "application/x-msmoney": [
        "mny"
    ],
    "application/x-mspublisher": [
        "pub"
    ],
    "application/x-msschedule": [
        "scd"
    ],
    "application/x-msterminal": [
        "trm"
    ],
    "application/x-mswrite": [
        "wri"
    ],
    "application/x-netcdf": [
        "nc",
        "cdf"
    ],
    "application/x-ns-proxy-autoconfig": [
        "pac"
    ],
    "application/x-nzb": [
        "nzb"
    ],
    "application/x-perl": [
        "pl",
        "pm"
    ],
    "application/x-pilot": [
        "*prc",
        "*pdb"
    ],
    "application/x-pkcs12": [
        "p12",
        "pfx"
    ],
    "application/x-pkcs7-certificates": [
        "p7b",
        "spc"
    ],
    "application/x-pkcs7-certreqresp": [
        "p7r"
    ],
    "application/x-rar-compressed": [
        "*rar"
    ],
    "application/x-redhat-package-manager": [
        "rpm"
    ],
    "application/x-research-info-systems": [
        "ris"
    ],
    "application/x-sea": [
        "sea"
    ],
    "application/x-sh": [
        "sh"
    ],
    "application/x-shar": [
        "shar"
    ],
    "application/x-shockwave-flash": [
        "swf"
    ],
    "application/x-silverlight-app": [
        "xap"
    ],
    "application/x-sql": [
        "sql"
    ],
    "application/x-stuffit": [
        "sit"
    ],
    "application/x-stuffitx": [
        "sitx"
    ],
    "application/x-subrip": [
        "srt"
    ],
    "application/x-sv4cpio": [
        "sv4cpio"
    ],
    "application/x-sv4crc": [
        "sv4crc"
    ],
    "application/x-t3vm-image": [
        "t3"
    ],
    "application/x-tads": [
        "gam"
    ],
    "application/x-tar": [
        "tar"
    ],
    "application/x-tcl": [
        "tcl",
        "tk"
    ],
    "application/x-tex": [
        "tex"
    ],
    "application/x-tex-tfm": [
        "tfm"
    ],
    "application/x-texinfo": [
        "texinfo",
        "texi"
    ],
    "application/x-tgif": [
        "*obj"
    ],
    "application/x-ustar": [
        "ustar"
    ],
    "application/x-virtualbox-hdd": [
        "hdd"
    ],
    "application/x-virtualbox-ova": [
        "ova"
    ],
    "application/x-virtualbox-ovf": [
        "ovf"
    ],
    "application/x-virtualbox-vbox": [
        "vbox"
    ],
    "application/x-virtualbox-vbox-extpack": [
        "vbox-extpack"
    ],
    "application/x-virtualbox-vdi": [
        "vdi"
    ],
    "application/x-virtualbox-vhd": [
        "vhd"
    ],
    "application/x-virtualbox-vmdk": [
        "vmdk"
    ],
    "application/x-wais-source": [
        "src"
    ],
    "application/x-web-app-manifest+json": [
        "webapp"
    ],
    "application/x-x509-ca-cert": [
        "der",
        "crt",
        "pem"
    ],
    "application/x-xfig": [
        "fig"
    ],
    "application/x-xliff+xml": [
        "*xlf"
    ],
    "application/x-xpinstall": [
        "xpi"
    ],
    "application/x-xz": [
        "xz"
    ],
    "application/x-zmachine": [
        "z1",
        "z2",
        "z3",
        "z4",
        "z5",
        "z6",
        "z7",
        "z8"
    ],
    "audio/vnd.dece.audio": [
        "uva",
        "uvva"
    ],
    "audio/vnd.digital-winds": [
        "eol"
    ],
    "audio/vnd.dra": [
        "dra"
    ],
    "audio/vnd.dts": [
        "dts"
    ],
    "audio/vnd.dts.hd": [
        "dtshd"
    ],
    "audio/vnd.lucent.voice": [
        "lvp"
    ],
    "audio/vnd.ms-playready.media.pya": [
        "pya"
    ],
    "audio/vnd.nuera.ecelp4800": [
        "ecelp4800"
    ],
    "audio/vnd.nuera.ecelp7470": [
        "ecelp7470"
    ],
    "audio/vnd.nuera.ecelp9600": [
        "ecelp9600"
    ],
    "audio/vnd.rip": [
        "rip"
    ],
    "audio/x-aac": [
        "aac"
    ],
    "audio/x-aiff": [
        "aif",
        "aiff",
        "aifc"
    ],
    "audio/x-caf": [
        "caf"
    ],
    "audio/x-flac": [
        "flac"
    ],
    "audio/x-m4a": [
        "*m4a"
    ],
    "audio/x-matroska": [
        "mka"
    ],
    "audio/x-mpegurl": [
        "m3u"
    ],
    "audio/x-ms-wax": [
        "wax"
    ],
    "audio/x-ms-wma": [
        "wma"
    ],
    "audio/x-pn-realaudio": [
        "ram",
        "ra"
    ],
    "audio/x-pn-realaudio-plugin": [
        "rmp"
    ],
    "audio/x-realaudio": [
        "*ra"
    ],
    "audio/x-wav": [
        "*wav"
    ],
    "chemical/x-cdx": [
        "cdx"
    ],
    "chemical/x-cif": [
        "cif"
    ],
    "chemical/x-cmdf": [
        "cmdf"
    ],
    "chemical/x-cml": [
        "cml"
    ],
    "chemical/x-csml": [
        "csml"
    ],
    "chemical/x-xyz": [
        "xyz"
    ],
    "image/prs.btif": [
        "btif"
    ],
    "image/prs.pti": [
        "pti"
    ],
    "image/vnd.adobe.photoshop": [
        "psd"
    ],
    "image/vnd.airzip.accelerator.azv": [
        "azv"
    ],
    "image/vnd.dece.graphic": [
        "uvi",
        "uvvi",
        "uvg",
        "uvvg"
    ],
    "image/vnd.djvu": [
        "djvu",
        "djv"
    ],
    "image/vnd.dvb.subtitle": [
        "*sub"
    ],
    "image/vnd.dwg": [
        "dwg"
    ],
    "image/vnd.dxf": [
        "dxf"
    ],
    "image/vnd.fastbidsheet": [
        "fbs"
    ],
    "image/vnd.fpx": [
        "fpx"
    ],
    "image/vnd.fst": [
        "fst"
    ],
    "image/vnd.fujixerox.edmics-mmr": [
        "mmr"
    ],
    "image/vnd.fujixerox.edmics-rlc": [
        "rlc"
    ],
    "image/vnd.microsoft.icon": [
        "ico"
    ],
    "image/vnd.ms-dds": [
        "dds"
    ],
    "image/vnd.ms-modi": [
        "mdi"
    ],
    "image/vnd.ms-photo": [
        "wdp"
    ],
    "image/vnd.net-fpx": [
        "npx"
    ],
    "image/vnd.pco.b16": [
        "b16"
    ],
    "image/vnd.tencent.tap": [
        "tap"
    ],
    "image/vnd.valve.source.texture": [
        "vtf"
    ],
    "image/vnd.wap.wbmp": [
        "wbmp"
    ],
    "image/vnd.xiff": [
        "xif"
    ],
    "image/vnd.zbrush.pcx": [
        "pcx"
    ],
    "image/x-3ds": [
        "3ds"
    ],
    "image/x-cmu-raster": [
        "ras"
    ],
    "image/x-cmx": [
        "cmx"
    ],
    "image/x-freehand": [
        "fh",
        "fhc",
        "fh4",
        "fh5",
        "fh7"
    ],
    "image/x-icon": [
        "*ico"
    ],
    "image/x-jng": [
        "jng"
    ],
    "image/x-mrsid-image": [
        "sid"
    ],
    "image/x-ms-bmp": [
        "*bmp"
    ],
    "image/x-pcx": [
        "*pcx"
    ],
    "image/x-pict": [
        "pic",
        "pct"
    ],
    "image/x-portable-anymap": [
        "pnm"
    ],
    "image/x-portable-bitmap": [
        "pbm"
    ],
    "image/x-portable-graymap": [
        "pgm"
    ],
    "image/x-portable-pixmap": [
        "ppm"
    ],
    "image/x-rgb": [
        "rgb"
    ],
    "image/x-tga": [
        "tga"
    ],
    "image/x-xbitmap": [
        "xbm"
    ],
    "image/x-xpixmap": [
        "xpm"
    ],
    "image/x-xwindowdump": [
        "xwd"
    ],
    "message/vnd.wfa.wsc": [
        "wsc"
    ],
    "model/vnd.collada+xml": [
        "dae"
    ],
    "model/vnd.dwf": [
        "dwf"
    ],
    "model/vnd.gdl": [
        "gdl"
    ],
    "model/vnd.gtw": [
        "gtw"
    ],
    "model/vnd.mts": [
        "mts"
    ],
    "model/vnd.opengex": [
        "ogex"
    ],
    "model/vnd.parasolid.transmit.binary": [
        "x_b"
    ],
    "model/vnd.parasolid.transmit.text": [
        "x_t"
    ],
    "model/vnd.sap.vds": [
        "vds"
    ],
    "model/vnd.usdz+zip": [
        "usdz"
    ],
    "model/vnd.valve.source.compiled-map": [
        "bsp"
    ],
    "model/vnd.vtu": [
        "vtu"
    ],
    "text/prs.lines.tag": [
        "dsc"
    ],
    "text/vnd.curl": [
        "curl"
    ],
    "text/vnd.curl.dcurl": [
        "dcurl"
    ],
    "text/vnd.curl.mcurl": [
        "mcurl"
    ],
    "text/vnd.curl.scurl": [
        "scurl"
    ],
    "text/vnd.dvb.subtitle": [
        "sub"
    ],
    "text/vnd.fly": [
        "fly"
    ],
    "text/vnd.fmi.flexstor": [
        "flx"
    ],
    "text/vnd.graphviz": [
        "gv"
    ],
    "text/vnd.in3d.3dml": [
        "3dml"
    ],
    "text/vnd.in3d.spot": [
        "spot"
    ],
    "text/vnd.sun.j2me.app-descriptor": [
        "jad"
    ],
    "text/vnd.wap.wml": [
        "wml"
    ],
    "text/vnd.wap.wmlscript": [
        "wmls"
    ],
    "text/x-asm": [
        "s",
        "asm"
    ],
    "text/x-c": [
        "c",
        "cc",
        "cxx",
        "cpp",
        "h",
        "hh",
        "dic"
    ],
    "text/x-component": [
        "htc"
    ],
    "text/x-fortran": [
        "f",
        "for",
        "f77",
        "f90"
    ],
    "text/x-handlebars-template": [
        "hbs"
    ],
    "text/x-java-source": [
        "java"
    ],
    "text/x-lua": [
        "lua"
    ],
    "text/x-markdown": [
        "mkd"
    ],
    "text/x-nfo": [
        "nfo"
    ],
    "text/x-opml": [
        "opml"
    ],
    "text/x-org": [
        "*org"
    ],
    "text/x-pascal": [
        "p",
        "pas"
    ],
    "text/x-processing": [
        "pde"
    ],
    "text/x-sass": [
        "sass"
    ],
    "text/x-scss": [
        "scss"
    ],
    "text/x-setext": [
        "etx"
    ],
    "text/x-sfv": [
        "sfv"
    ],
    "text/x-suse-ymp": [
        "ymp"
    ],
    "text/x-uuencode": [
        "uu"
    ],
    "text/x-vcalendar": [
        "vcs"
    ],
    "text/x-vcard": [
        "vcf"
    ],
    "video/vnd.dece.hd": [
        "uvh",
        "uvvh"
    ],
    "video/vnd.dece.mobile": [
        "uvm",
        "uvvm"
    ],
    "video/vnd.dece.pd": [
        "uvp",
        "uvvp"
    ],
    "video/vnd.dece.sd": [
        "uvs",
        "uvvs"
    ],
    "video/vnd.dece.video": [
        "uvv",
        "uvvv"
    ],
    "video/vnd.dvb.file": [
        "dvb"
    ],
    "video/vnd.fvt": [
        "fvt"
    ],
    "video/vnd.mpegurl": [
        "mxu",
        "m4u"
    ],
    "video/vnd.ms-playready.media.pyv": [
        "pyv"
    ],
    "video/vnd.uvvu.mp4": [
        "uvu",
        "uvvu"
    ],
    "video/vnd.vivo": [
        "viv"
    ],
    "video/x-f4v": [
        "f4v"
    ],
    "video/x-fli": [
        "fli"
    ],
    "video/x-flv": [
        "flv"
    ],
    "video/x-m4v": [
        "m4v"
    ],
    "video/x-matroska": [
        "mkv",
        "mk3d",
        "mks"
    ],
    "video/x-mng": [
        "mng"
    ],
    "video/x-ms-asf": [
        "asf",
        "asx"
    ],
    "video/x-ms-vob": [
        "vob"
    ],
    "video/x-ms-wm": [
        "wm"
    ],
    "video/x-ms-wmv": [
        "wmv"
    ],
    "video/x-ms-wmx": [
        "wmx"
    ],
    "video/x-ms-wvx": [
        "wvx"
    ],
    "video/x-msvideo": [
        "avi"
    ],
    "video/x-sgi-movie": [
        "movie"
    ],
    "video/x-smv": [
        "smv"
    ],
    "x-conference/x-cooltalk": [
        "ice"
    ]
};
}),
"[project]/node_modules/mime/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

let Mime = __turbopack_context__.r("[project]/node_modules/mime/Mime.js [app-route] (ecmascript)");
module.exports = new Mime(__turbopack_context__.r("[project]/node_modules/mime/types/standard.js [app-route] (ecmascript)"), __turbopack_context__.r("[project]/node_modules/mime/types/other.js [app-route] (ecmascript)"));
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/maps/decode.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"0":65533,"128":8364,"130":8218,"131":402,"132":8222,"133":8230,"134":8224,"135":8225,"136":710,"137":8240,"138":352,"139":8249,"140":338,"142":381,"145":8216,"146":8217,"147":8220,"148":8221,"149":8226,"150":8211,"151":8212,"152":732,"153":8482,"154":353,"155":8250,"156":339,"158":382,"159":376});}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/decode_codepoint.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __importDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
var decode_json_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/maps/decode.json (json)"));
// Adapted from https://github.com/mathiasbynens/he/blob/master/src/he.js#L94-L119
var fromCodePoint = // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
String.fromCodePoint || function(codePoint) {
    var output = "";
    if (codePoint > 0xffff) {
        codePoint -= 0x10000;
        output += String.fromCharCode(codePoint >>> 10 & 0x3ff | 0xd800);
        codePoint = 0xdc00 | codePoint & 0x3ff;
    }
    output += String.fromCharCode(codePoint);
    return output;
};
function decodeCodePoint(codePoint) {
    if (codePoint >= 0xd800 && codePoint <= 0xdfff || codePoint > 0x10ffff) {
        return "\uFFFD";
    }
    if (codePoint in decode_json_1.default) {
        codePoint = decode_json_1.default[codePoint];
    }
    return fromCodePoint(codePoint);
}
exports.default = decodeCodePoint;
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/maps/entities.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("{\"Aacute\":\"Á\",\"aacute\":\"á\",\"Abreve\":\"Ă\",\"abreve\":\"ă\",\"ac\":\"∾\",\"acd\":\"∿\",\"acE\":\"∾̳\",\"Acirc\":\"Â\",\"acirc\":\"â\",\"acute\":\"´\",\"Acy\":\"А\",\"acy\":\"а\",\"AElig\":\"Æ\",\"aelig\":\"æ\",\"af\":\"⁡\",\"Afr\":\"𝔄\",\"afr\":\"𝔞\",\"Agrave\":\"À\",\"agrave\":\"à\",\"alefsym\":\"ℵ\",\"aleph\":\"ℵ\",\"Alpha\":\"Α\",\"alpha\":\"α\",\"Amacr\":\"Ā\",\"amacr\":\"ā\",\"amalg\":\"⨿\",\"amp\":\"&\",\"AMP\":\"&\",\"andand\":\"⩕\",\"And\":\"⩓\",\"and\":\"∧\",\"andd\":\"⩜\",\"andslope\":\"⩘\",\"andv\":\"⩚\",\"ang\":\"∠\",\"ange\":\"⦤\",\"angle\":\"∠\",\"angmsdaa\":\"⦨\",\"angmsdab\":\"⦩\",\"angmsdac\":\"⦪\",\"angmsdad\":\"⦫\",\"angmsdae\":\"⦬\",\"angmsdaf\":\"⦭\",\"angmsdag\":\"⦮\",\"angmsdah\":\"⦯\",\"angmsd\":\"∡\",\"angrt\":\"∟\",\"angrtvb\":\"⊾\",\"angrtvbd\":\"⦝\",\"angsph\":\"∢\",\"angst\":\"Å\",\"angzarr\":\"⍼\",\"Aogon\":\"Ą\",\"aogon\":\"ą\",\"Aopf\":\"𝔸\",\"aopf\":\"𝕒\",\"apacir\":\"⩯\",\"ap\":\"≈\",\"apE\":\"⩰\",\"ape\":\"≊\",\"apid\":\"≋\",\"apos\":\"'\",\"ApplyFunction\":\"⁡\",\"approx\":\"≈\",\"approxeq\":\"≊\",\"Aring\":\"Å\",\"aring\":\"å\",\"Ascr\":\"𝒜\",\"ascr\":\"𝒶\",\"Assign\":\"≔\",\"ast\":\"*\",\"asymp\":\"≈\",\"asympeq\":\"≍\",\"Atilde\":\"Ã\",\"atilde\":\"ã\",\"Auml\":\"Ä\",\"auml\":\"ä\",\"awconint\":\"∳\",\"awint\":\"⨑\",\"backcong\":\"≌\",\"backepsilon\":\"϶\",\"backprime\":\"‵\",\"backsim\":\"∽\",\"backsimeq\":\"⋍\",\"Backslash\":\"∖\",\"Barv\":\"⫧\",\"barvee\":\"⊽\",\"barwed\":\"⌅\",\"Barwed\":\"⌆\",\"barwedge\":\"⌅\",\"bbrk\":\"⎵\",\"bbrktbrk\":\"⎶\",\"bcong\":\"≌\",\"Bcy\":\"Б\",\"bcy\":\"б\",\"bdquo\":\"„\",\"becaus\":\"∵\",\"because\":\"∵\",\"Because\":\"∵\",\"bemptyv\":\"⦰\",\"bepsi\":\"϶\",\"bernou\":\"ℬ\",\"Bernoullis\":\"ℬ\",\"Beta\":\"Β\",\"beta\":\"β\",\"beth\":\"ℶ\",\"between\":\"≬\",\"Bfr\":\"𝔅\",\"bfr\":\"𝔟\",\"bigcap\":\"⋂\",\"bigcirc\":\"◯\",\"bigcup\":\"⋃\",\"bigodot\":\"⨀\",\"bigoplus\":\"⨁\",\"bigotimes\":\"⨂\",\"bigsqcup\":\"⨆\",\"bigstar\":\"★\",\"bigtriangledown\":\"▽\",\"bigtriangleup\":\"△\",\"biguplus\":\"⨄\",\"bigvee\":\"⋁\",\"bigwedge\":\"⋀\",\"bkarow\":\"⤍\",\"blacklozenge\":\"⧫\",\"blacksquare\":\"▪\",\"blacktriangle\":\"▴\",\"blacktriangledown\":\"▾\",\"blacktriangleleft\":\"◂\",\"blacktriangleright\":\"▸\",\"blank\":\"␣\",\"blk12\":\"▒\",\"blk14\":\"░\",\"blk34\":\"▓\",\"block\":\"█\",\"bne\":\"=⃥\",\"bnequiv\":\"≡⃥\",\"bNot\":\"⫭\",\"bnot\":\"⌐\",\"Bopf\":\"𝔹\",\"bopf\":\"𝕓\",\"bot\":\"⊥\",\"bottom\":\"⊥\",\"bowtie\":\"⋈\",\"boxbox\":\"⧉\",\"boxdl\":\"┐\",\"boxdL\":\"╕\",\"boxDl\":\"╖\",\"boxDL\":\"╗\",\"boxdr\":\"┌\",\"boxdR\":\"╒\",\"boxDr\":\"╓\",\"boxDR\":\"╔\",\"boxh\":\"─\",\"boxH\":\"═\",\"boxhd\":\"┬\",\"boxHd\":\"╤\",\"boxhD\":\"╥\",\"boxHD\":\"╦\",\"boxhu\":\"┴\",\"boxHu\":\"╧\",\"boxhU\":\"╨\",\"boxHU\":\"╩\",\"boxminus\":\"⊟\",\"boxplus\":\"⊞\",\"boxtimes\":\"⊠\",\"boxul\":\"┘\",\"boxuL\":\"╛\",\"boxUl\":\"╜\",\"boxUL\":\"╝\",\"boxur\":\"└\",\"boxuR\":\"╘\",\"boxUr\":\"╙\",\"boxUR\":\"╚\",\"boxv\":\"│\",\"boxV\":\"║\",\"boxvh\":\"┼\",\"boxvH\":\"╪\",\"boxVh\":\"╫\",\"boxVH\":\"╬\",\"boxvl\":\"┤\",\"boxvL\":\"╡\",\"boxVl\":\"╢\",\"boxVL\":\"╣\",\"boxvr\":\"├\",\"boxvR\":\"╞\",\"boxVr\":\"╟\",\"boxVR\":\"╠\",\"bprime\":\"‵\",\"breve\":\"˘\",\"Breve\":\"˘\",\"brvbar\":\"¦\",\"bscr\":\"𝒷\",\"Bscr\":\"ℬ\",\"bsemi\":\"⁏\",\"bsim\":\"∽\",\"bsime\":\"⋍\",\"bsolb\":\"⧅\",\"bsol\":\"\\\\\",\"bsolhsub\":\"⟈\",\"bull\":\"•\",\"bullet\":\"•\",\"bump\":\"≎\",\"bumpE\":\"⪮\",\"bumpe\":\"≏\",\"Bumpeq\":\"≎\",\"bumpeq\":\"≏\",\"Cacute\":\"Ć\",\"cacute\":\"ć\",\"capand\":\"⩄\",\"capbrcup\":\"⩉\",\"capcap\":\"⩋\",\"cap\":\"∩\",\"Cap\":\"⋒\",\"capcup\":\"⩇\",\"capdot\":\"⩀\",\"CapitalDifferentialD\":\"ⅅ\",\"caps\":\"∩︀\",\"caret\":\"⁁\",\"caron\":\"ˇ\",\"Cayleys\":\"ℭ\",\"ccaps\":\"⩍\",\"Ccaron\":\"Č\",\"ccaron\":\"č\",\"Ccedil\":\"Ç\",\"ccedil\":\"ç\",\"Ccirc\":\"Ĉ\",\"ccirc\":\"ĉ\",\"Cconint\":\"∰\",\"ccups\":\"⩌\",\"ccupssm\":\"⩐\",\"Cdot\":\"Ċ\",\"cdot\":\"ċ\",\"cedil\":\"¸\",\"Cedilla\":\"¸\",\"cemptyv\":\"⦲\",\"cent\":\"¢\",\"centerdot\":\"·\",\"CenterDot\":\"·\",\"cfr\":\"𝔠\",\"Cfr\":\"ℭ\",\"CHcy\":\"Ч\",\"chcy\":\"ч\",\"check\":\"✓\",\"checkmark\":\"✓\",\"Chi\":\"Χ\",\"chi\":\"χ\",\"circ\":\"ˆ\",\"circeq\":\"≗\",\"circlearrowleft\":\"↺\",\"circlearrowright\":\"↻\",\"circledast\":\"⊛\",\"circledcirc\":\"⊚\",\"circleddash\":\"⊝\",\"CircleDot\":\"⊙\",\"circledR\":\"®\",\"circledS\":\"Ⓢ\",\"CircleMinus\":\"⊖\",\"CirclePlus\":\"⊕\",\"CircleTimes\":\"⊗\",\"cir\":\"○\",\"cirE\":\"⧃\",\"cire\":\"≗\",\"cirfnint\":\"⨐\",\"cirmid\":\"⫯\",\"cirscir\":\"⧂\",\"ClockwiseContourIntegral\":\"∲\",\"CloseCurlyDoubleQuote\":\"”\",\"CloseCurlyQuote\":\"’\",\"clubs\":\"♣\",\"clubsuit\":\"♣\",\"colon\":\":\",\"Colon\":\"∷\",\"Colone\":\"⩴\",\"colone\":\"≔\",\"coloneq\":\"≔\",\"comma\":\",\",\"commat\":\"@\",\"comp\":\"∁\",\"compfn\":\"∘\",\"complement\":\"∁\",\"complexes\":\"ℂ\",\"cong\":\"≅\",\"congdot\":\"⩭\",\"Congruent\":\"≡\",\"conint\":\"∮\",\"Conint\":\"∯\",\"ContourIntegral\":\"∮\",\"copf\":\"𝕔\",\"Copf\":\"ℂ\",\"coprod\":\"∐\",\"Coproduct\":\"∐\",\"copy\":\"©\",\"COPY\":\"©\",\"copysr\":\"℗\",\"CounterClockwiseContourIntegral\":\"∳\",\"crarr\":\"↵\",\"cross\":\"✗\",\"Cross\":\"⨯\",\"Cscr\":\"𝒞\",\"cscr\":\"𝒸\",\"csub\":\"⫏\",\"csube\":\"⫑\",\"csup\":\"⫐\",\"csupe\":\"⫒\",\"ctdot\":\"⋯\",\"cudarrl\":\"⤸\",\"cudarrr\":\"⤵\",\"cuepr\":\"⋞\",\"cuesc\":\"⋟\",\"cularr\":\"↶\",\"cularrp\":\"⤽\",\"cupbrcap\":\"⩈\",\"cupcap\":\"⩆\",\"CupCap\":\"≍\",\"cup\":\"∪\",\"Cup\":\"⋓\",\"cupcup\":\"⩊\",\"cupdot\":\"⊍\",\"cupor\":\"⩅\",\"cups\":\"∪︀\",\"curarr\":\"↷\",\"curarrm\":\"⤼\",\"curlyeqprec\":\"⋞\",\"curlyeqsucc\":\"⋟\",\"curlyvee\":\"⋎\",\"curlywedge\":\"⋏\",\"curren\":\"¤\",\"curvearrowleft\":\"↶\",\"curvearrowright\":\"↷\",\"cuvee\":\"⋎\",\"cuwed\":\"⋏\",\"cwconint\":\"∲\",\"cwint\":\"∱\",\"cylcty\":\"⌭\",\"dagger\":\"†\",\"Dagger\":\"‡\",\"daleth\":\"ℸ\",\"darr\":\"↓\",\"Darr\":\"↡\",\"dArr\":\"⇓\",\"dash\":\"‐\",\"Dashv\":\"⫤\",\"dashv\":\"⊣\",\"dbkarow\":\"⤏\",\"dblac\":\"˝\",\"Dcaron\":\"Ď\",\"dcaron\":\"ď\",\"Dcy\":\"Д\",\"dcy\":\"д\",\"ddagger\":\"‡\",\"ddarr\":\"⇊\",\"DD\":\"ⅅ\",\"dd\":\"ⅆ\",\"DDotrahd\":\"⤑\",\"ddotseq\":\"⩷\",\"deg\":\"°\",\"Del\":\"∇\",\"Delta\":\"Δ\",\"delta\":\"δ\",\"demptyv\":\"⦱\",\"dfisht\":\"⥿\",\"Dfr\":\"𝔇\",\"dfr\":\"𝔡\",\"dHar\":\"⥥\",\"dharl\":\"⇃\",\"dharr\":\"⇂\",\"DiacriticalAcute\":\"´\",\"DiacriticalDot\":\"˙\",\"DiacriticalDoubleAcute\":\"˝\",\"DiacriticalGrave\":\"`\",\"DiacriticalTilde\":\"˜\",\"diam\":\"⋄\",\"diamond\":\"⋄\",\"Diamond\":\"⋄\",\"diamondsuit\":\"♦\",\"diams\":\"♦\",\"die\":\"¨\",\"DifferentialD\":\"ⅆ\",\"digamma\":\"ϝ\",\"disin\":\"⋲\",\"div\":\"÷\",\"divide\":\"÷\",\"divideontimes\":\"⋇\",\"divonx\":\"⋇\",\"DJcy\":\"Ђ\",\"djcy\":\"ђ\",\"dlcorn\":\"⌞\",\"dlcrop\":\"⌍\",\"dollar\":\"$\",\"Dopf\":\"𝔻\",\"dopf\":\"𝕕\",\"Dot\":\"¨\",\"dot\":\"˙\",\"DotDot\":\"⃜\",\"doteq\":\"≐\",\"doteqdot\":\"≑\",\"DotEqual\":\"≐\",\"dotminus\":\"∸\",\"dotplus\":\"∔\",\"dotsquare\":\"⊡\",\"doublebarwedge\":\"⌆\",\"DoubleContourIntegral\":\"∯\",\"DoubleDot\":\"¨\",\"DoubleDownArrow\":\"⇓\",\"DoubleLeftArrow\":\"⇐\",\"DoubleLeftRightArrow\":\"⇔\",\"DoubleLeftTee\":\"⫤\",\"DoubleLongLeftArrow\":\"⟸\",\"DoubleLongLeftRightArrow\":\"⟺\",\"DoubleLongRightArrow\":\"⟹\",\"DoubleRightArrow\":\"⇒\",\"DoubleRightTee\":\"⊨\",\"DoubleUpArrow\":\"⇑\",\"DoubleUpDownArrow\":\"⇕\",\"DoubleVerticalBar\":\"∥\",\"DownArrowBar\":\"⤓\",\"downarrow\":\"↓\",\"DownArrow\":\"↓\",\"Downarrow\":\"⇓\",\"DownArrowUpArrow\":\"⇵\",\"DownBreve\":\"̑\",\"downdownarrows\":\"⇊\",\"downharpoonleft\":\"⇃\",\"downharpoonright\":\"⇂\",\"DownLeftRightVector\":\"⥐\",\"DownLeftTeeVector\":\"⥞\",\"DownLeftVectorBar\":\"⥖\",\"DownLeftVector\":\"↽\",\"DownRightTeeVector\":\"⥟\",\"DownRightVectorBar\":\"⥗\",\"DownRightVector\":\"⇁\",\"DownTeeArrow\":\"↧\",\"DownTee\":\"⊤\",\"drbkarow\":\"⤐\",\"drcorn\":\"⌟\",\"drcrop\":\"⌌\",\"Dscr\":\"𝒟\",\"dscr\":\"𝒹\",\"DScy\":\"Ѕ\",\"dscy\":\"ѕ\",\"dsol\":\"⧶\",\"Dstrok\":\"Đ\",\"dstrok\":\"đ\",\"dtdot\":\"⋱\",\"dtri\":\"▿\",\"dtrif\":\"▾\",\"duarr\":\"⇵\",\"duhar\":\"⥯\",\"dwangle\":\"⦦\",\"DZcy\":\"Џ\",\"dzcy\":\"џ\",\"dzigrarr\":\"⟿\",\"Eacute\":\"É\",\"eacute\":\"é\",\"easter\":\"⩮\",\"Ecaron\":\"Ě\",\"ecaron\":\"ě\",\"Ecirc\":\"Ê\",\"ecirc\":\"ê\",\"ecir\":\"≖\",\"ecolon\":\"≕\",\"Ecy\":\"Э\",\"ecy\":\"э\",\"eDDot\":\"⩷\",\"Edot\":\"Ė\",\"edot\":\"ė\",\"eDot\":\"≑\",\"ee\":\"ⅇ\",\"efDot\":\"≒\",\"Efr\":\"𝔈\",\"efr\":\"𝔢\",\"eg\":\"⪚\",\"Egrave\":\"È\",\"egrave\":\"è\",\"egs\":\"⪖\",\"egsdot\":\"⪘\",\"el\":\"⪙\",\"Element\":\"∈\",\"elinters\":\"⏧\",\"ell\":\"ℓ\",\"els\":\"⪕\",\"elsdot\":\"⪗\",\"Emacr\":\"Ē\",\"emacr\":\"ē\",\"empty\":\"∅\",\"emptyset\":\"∅\",\"EmptySmallSquare\":\"◻\",\"emptyv\":\"∅\",\"EmptyVerySmallSquare\":\"▫\",\"emsp13\":\" \",\"emsp14\":\" \",\"emsp\":\" \",\"ENG\":\"Ŋ\",\"eng\":\"ŋ\",\"ensp\":\" \",\"Eogon\":\"Ę\",\"eogon\":\"ę\",\"Eopf\":\"𝔼\",\"eopf\":\"𝕖\",\"epar\":\"⋕\",\"eparsl\":\"⧣\",\"eplus\":\"⩱\",\"epsi\":\"ε\",\"Epsilon\":\"Ε\",\"epsilon\":\"ε\",\"epsiv\":\"ϵ\",\"eqcirc\":\"≖\",\"eqcolon\":\"≕\",\"eqsim\":\"≂\",\"eqslantgtr\":\"⪖\",\"eqslantless\":\"⪕\",\"Equal\":\"⩵\",\"equals\":\"=\",\"EqualTilde\":\"≂\",\"equest\":\"≟\",\"Equilibrium\":\"⇌\",\"equiv\":\"≡\",\"equivDD\":\"⩸\",\"eqvparsl\":\"⧥\",\"erarr\":\"⥱\",\"erDot\":\"≓\",\"escr\":\"ℯ\",\"Escr\":\"ℰ\",\"esdot\":\"≐\",\"Esim\":\"⩳\",\"esim\":\"≂\",\"Eta\":\"Η\",\"eta\":\"η\",\"ETH\":\"Ð\",\"eth\":\"ð\",\"Euml\":\"Ë\",\"euml\":\"ë\",\"euro\":\"€\",\"excl\":\"!\",\"exist\":\"∃\",\"Exists\":\"∃\",\"expectation\":\"ℰ\",\"exponentiale\":\"ⅇ\",\"ExponentialE\":\"ⅇ\",\"fallingdotseq\":\"≒\",\"Fcy\":\"Ф\",\"fcy\":\"ф\",\"female\":\"♀\",\"ffilig\":\"ﬃ\",\"fflig\":\"ﬀ\",\"ffllig\":\"ﬄ\",\"Ffr\":\"𝔉\",\"ffr\":\"𝔣\",\"filig\":\"ﬁ\",\"FilledSmallSquare\":\"◼\",\"FilledVerySmallSquare\":\"▪\",\"fjlig\":\"fj\",\"flat\":\"♭\",\"fllig\":\"ﬂ\",\"fltns\":\"▱\",\"fnof\":\"ƒ\",\"Fopf\":\"𝔽\",\"fopf\":\"𝕗\",\"forall\":\"∀\",\"ForAll\":\"∀\",\"fork\":\"⋔\",\"forkv\":\"⫙\",\"Fouriertrf\":\"ℱ\",\"fpartint\":\"⨍\",\"frac12\":\"½\",\"frac13\":\"⅓\",\"frac14\":\"¼\",\"frac15\":\"⅕\",\"frac16\":\"⅙\",\"frac18\":\"⅛\",\"frac23\":\"⅔\",\"frac25\":\"⅖\",\"frac34\":\"¾\",\"frac35\":\"⅗\",\"frac38\":\"⅜\",\"frac45\":\"⅘\",\"frac56\":\"⅚\",\"frac58\":\"⅝\",\"frac78\":\"⅞\",\"frasl\":\"⁄\",\"frown\":\"⌢\",\"fscr\":\"𝒻\",\"Fscr\":\"ℱ\",\"gacute\":\"ǵ\",\"Gamma\":\"Γ\",\"gamma\":\"γ\",\"Gammad\":\"Ϝ\",\"gammad\":\"ϝ\",\"gap\":\"⪆\",\"Gbreve\":\"Ğ\",\"gbreve\":\"ğ\",\"Gcedil\":\"Ģ\",\"Gcirc\":\"Ĝ\",\"gcirc\":\"ĝ\",\"Gcy\":\"Г\",\"gcy\":\"г\",\"Gdot\":\"Ġ\",\"gdot\":\"ġ\",\"ge\":\"≥\",\"gE\":\"≧\",\"gEl\":\"⪌\",\"gel\":\"⋛\",\"geq\":\"≥\",\"geqq\":\"≧\",\"geqslant\":\"⩾\",\"gescc\":\"⪩\",\"ges\":\"⩾\",\"gesdot\":\"⪀\",\"gesdoto\":\"⪂\",\"gesdotol\":\"⪄\",\"gesl\":\"⋛︀\",\"gesles\":\"⪔\",\"Gfr\":\"𝔊\",\"gfr\":\"𝔤\",\"gg\":\"≫\",\"Gg\":\"⋙\",\"ggg\":\"⋙\",\"gimel\":\"ℷ\",\"GJcy\":\"Ѓ\",\"gjcy\":\"ѓ\",\"gla\":\"⪥\",\"gl\":\"≷\",\"glE\":\"⪒\",\"glj\":\"⪤\",\"gnap\":\"⪊\",\"gnapprox\":\"⪊\",\"gne\":\"⪈\",\"gnE\":\"≩\",\"gneq\":\"⪈\",\"gneqq\":\"≩\",\"gnsim\":\"⋧\",\"Gopf\":\"𝔾\",\"gopf\":\"𝕘\",\"grave\":\"`\",\"GreaterEqual\":\"≥\",\"GreaterEqualLess\":\"⋛\",\"GreaterFullEqual\":\"≧\",\"GreaterGreater\":\"⪢\",\"GreaterLess\":\"≷\",\"GreaterSlantEqual\":\"⩾\",\"GreaterTilde\":\"≳\",\"Gscr\":\"𝒢\",\"gscr\":\"ℊ\",\"gsim\":\"≳\",\"gsime\":\"⪎\",\"gsiml\":\"⪐\",\"gtcc\":\"⪧\",\"gtcir\":\"⩺\",\"gt\":\">\",\"GT\":\">\",\"Gt\":\"≫\",\"gtdot\":\"⋗\",\"gtlPar\":\"⦕\",\"gtquest\":\"⩼\",\"gtrapprox\":\"⪆\",\"gtrarr\":\"⥸\",\"gtrdot\":\"⋗\",\"gtreqless\":\"⋛\",\"gtreqqless\":\"⪌\",\"gtrless\":\"≷\",\"gtrsim\":\"≳\",\"gvertneqq\":\"≩︀\",\"gvnE\":\"≩︀\",\"Hacek\":\"ˇ\",\"hairsp\":\" \",\"half\":\"½\",\"hamilt\":\"ℋ\",\"HARDcy\":\"Ъ\",\"hardcy\":\"ъ\",\"harrcir\":\"⥈\",\"harr\":\"↔\",\"hArr\":\"⇔\",\"harrw\":\"↭\",\"Hat\":\"^\",\"hbar\":\"ℏ\",\"Hcirc\":\"Ĥ\",\"hcirc\":\"ĥ\",\"hearts\":\"♥\",\"heartsuit\":\"♥\",\"hellip\":\"…\",\"hercon\":\"⊹\",\"hfr\":\"𝔥\",\"Hfr\":\"ℌ\",\"HilbertSpace\":\"ℋ\",\"hksearow\":\"⤥\",\"hkswarow\":\"⤦\",\"hoarr\":\"⇿\",\"homtht\":\"∻\",\"hookleftarrow\":\"↩\",\"hookrightarrow\":\"↪\",\"hopf\":\"𝕙\",\"Hopf\":\"ℍ\",\"horbar\":\"―\",\"HorizontalLine\":\"─\",\"hscr\":\"𝒽\",\"Hscr\":\"ℋ\",\"hslash\":\"ℏ\",\"Hstrok\":\"Ħ\",\"hstrok\":\"ħ\",\"HumpDownHump\":\"≎\",\"HumpEqual\":\"≏\",\"hybull\":\"⁃\",\"hyphen\":\"‐\",\"Iacute\":\"Í\",\"iacute\":\"í\",\"ic\":\"⁣\",\"Icirc\":\"Î\",\"icirc\":\"î\",\"Icy\":\"И\",\"icy\":\"и\",\"Idot\":\"İ\",\"IEcy\":\"Е\",\"iecy\":\"е\",\"iexcl\":\"¡\",\"iff\":\"⇔\",\"ifr\":\"𝔦\",\"Ifr\":\"ℑ\",\"Igrave\":\"Ì\",\"igrave\":\"ì\",\"ii\":\"ⅈ\",\"iiiint\":\"⨌\",\"iiint\":\"∭\",\"iinfin\":\"⧜\",\"iiota\":\"℩\",\"IJlig\":\"Ĳ\",\"ijlig\":\"ĳ\",\"Imacr\":\"Ī\",\"imacr\":\"ī\",\"image\":\"ℑ\",\"ImaginaryI\":\"ⅈ\",\"imagline\":\"ℐ\",\"imagpart\":\"ℑ\",\"imath\":\"ı\",\"Im\":\"ℑ\",\"imof\":\"⊷\",\"imped\":\"Ƶ\",\"Implies\":\"⇒\",\"incare\":\"℅\",\"in\":\"∈\",\"infin\":\"∞\",\"infintie\":\"⧝\",\"inodot\":\"ı\",\"intcal\":\"⊺\",\"int\":\"∫\",\"Int\":\"∬\",\"integers\":\"ℤ\",\"Integral\":\"∫\",\"intercal\":\"⊺\",\"Intersection\":\"⋂\",\"intlarhk\":\"⨗\",\"intprod\":\"⨼\",\"InvisibleComma\":\"⁣\",\"InvisibleTimes\":\"⁢\",\"IOcy\":\"Ё\",\"iocy\":\"ё\",\"Iogon\":\"Į\",\"iogon\":\"į\",\"Iopf\":\"𝕀\",\"iopf\":\"𝕚\",\"Iota\":\"Ι\",\"iota\":\"ι\",\"iprod\":\"⨼\",\"iquest\":\"¿\",\"iscr\":\"𝒾\",\"Iscr\":\"ℐ\",\"isin\":\"∈\",\"isindot\":\"⋵\",\"isinE\":\"⋹\",\"isins\":\"⋴\",\"isinsv\":\"⋳\",\"isinv\":\"∈\",\"it\":\"⁢\",\"Itilde\":\"Ĩ\",\"itilde\":\"ĩ\",\"Iukcy\":\"І\",\"iukcy\":\"і\",\"Iuml\":\"Ï\",\"iuml\":\"ï\",\"Jcirc\":\"Ĵ\",\"jcirc\":\"ĵ\",\"Jcy\":\"Й\",\"jcy\":\"й\",\"Jfr\":\"𝔍\",\"jfr\":\"𝔧\",\"jmath\":\"ȷ\",\"Jopf\":\"𝕁\",\"jopf\":\"𝕛\",\"Jscr\":\"𝒥\",\"jscr\":\"𝒿\",\"Jsercy\":\"Ј\",\"jsercy\":\"ј\",\"Jukcy\":\"Є\",\"jukcy\":\"є\",\"Kappa\":\"Κ\",\"kappa\":\"κ\",\"kappav\":\"ϰ\",\"Kcedil\":\"Ķ\",\"kcedil\":\"ķ\",\"Kcy\":\"К\",\"kcy\":\"к\",\"Kfr\":\"𝔎\",\"kfr\":\"𝔨\",\"kgreen\":\"ĸ\",\"KHcy\":\"Х\",\"khcy\":\"х\",\"KJcy\":\"Ќ\",\"kjcy\":\"ќ\",\"Kopf\":\"𝕂\",\"kopf\":\"𝕜\",\"Kscr\":\"𝒦\",\"kscr\":\"𝓀\",\"lAarr\":\"⇚\",\"Lacute\":\"Ĺ\",\"lacute\":\"ĺ\",\"laemptyv\":\"⦴\",\"lagran\":\"ℒ\",\"Lambda\":\"Λ\",\"lambda\":\"λ\",\"lang\":\"⟨\",\"Lang\":\"⟪\",\"langd\":\"⦑\",\"langle\":\"⟨\",\"lap\":\"⪅\",\"Laplacetrf\":\"ℒ\",\"laquo\":\"«\",\"larrb\":\"⇤\",\"larrbfs\":\"⤟\",\"larr\":\"←\",\"Larr\":\"↞\",\"lArr\":\"⇐\",\"larrfs\":\"⤝\",\"larrhk\":\"↩\",\"larrlp\":\"↫\",\"larrpl\":\"⤹\",\"larrsim\":\"⥳\",\"larrtl\":\"↢\",\"latail\":\"⤙\",\"lAtail\":\"⤛\",\"lat\":\"⪫\",\"late\":\"⪭\",\"lates\":\"⪭︀\",\"lbarr\":\"⤌\",\"lBarr\":\"⤎\",\"lbbrk\":\"❲\",\"lbrace\":\"{\",\"lbrack\":\"[\",\"lbrke\":\"⦋\",\"lbrksld\":\"⦏\",\"lbrkslu\":\"⦍\",\"Lcaron\":\"Ľ\",\"lcaron\":\"ľ\",\"Lcedil\":\"Ļ\",\"lcedil\":\"ļ\",\"lceil\":\"⌈\",\"lcub\":\"{\",\"Lcy\":\"Л\",\"lcy\":\"л\",\"ldca\":\"⤶\",\"ldquo\":\"“\",\"ldquor\":\"„\",\"ldrdhar\":\"⥧\",\"ldrushar\":\"⥋\",\"ldsh\":\"↲\",\"le\":\"≤\",\"lE\":\"≦\",\"LeftAngleBracket\":\"⟨\",\"LeftArrowBar\":\"⇤\",\"leftarrow\":\"←\",\"LeftArrow\":\"←\",\"Leftarrow\":\"⇐\",\"LeftArrowRightArrow\":\"⇆\",\"leftarrowtail\":\"↢\",\"LeftCeiling\":\"⌈\",\"LeftDoubleBracket\":\"⟦\",\"LeftDownTeeVector\":\"⥡\",\"LeftDownVectorBar\":\"⥙\",\"LeftDownVector\":\"⇃\",\"LeftFloor\":\"⌊\",\"leftharpoondown\":\"↽\",\"leftharpoonup\":\"↼\",\"leftleftarrows\":\"⇇\",\"leftrightarrow\":\"↔\",\"LeftRightArrow\":\"↔\",\"Leftrightarrow\":\"⇔\",\"leftrightarrows\":\"⇆\",\"leftrightharpoons\":\"⇋\",\"leftrightsquigarrow\":\"↭\",\"LeftRightVector\":\"⥎\",\"LeftTeeArrow\":\"↤\",\"LeftTee\":\"⊣\",\"LeftTeeVector\":\"⥚\",\"leftthreetimes\":\"⋋\",\"LeftTriangleBar\":\"⧏\",\"LeftTriangle\":\"⊲\",\"LeftTriangleEqual\":\"⊴\",\"LeftUpDownVector\":\"⥑\",\"LeftUpTeeVector\":\"⥠\",\"LeftUpVectorBar\":\"⥘\",\"LeftUpVector\":\"↿\",\"LeftVectorBar\":\"⥒\",\"LeftVector\":\"↼\",\"lEg\":\"⪋\",\"leg\":\"⋚\",\"leq\":\"≤\",\"leqq\":\"≦\",\"leqslant\":\"⩽\",\"lescc\":\"⪨\",\"les\":\"⩽\",\"lesdot\":\"⩿\",\"lesdoto\":\"⪁\",\"lesdotor\":\"⪃\",\"lesg\":\"⋚︀\",\"lesges\":\"⪓\",\"lessapprox\":\"⪅\",\"lessdot\":\"⋖\",\"lesseqgtr\":\"⋚\",\"lesseqqgtr\":\"⪋\",\"LessEqualGreater\":\"⋚\",\"LessFullEqual\":\"≦\",\"LessGreater\":\"≶\",\"lessgtr\":\"≶\",\"LessLess\":\"⪡\",\"lesssim\":\"≲\",\"LessSlantEqual\":\"⩽\",\"LessTilde\":\"≲\",\"lfisht\":\"⥼\",\"lfloor\":\"⌊\",\"Lfr\":\"𝔏\",\"lfr\":\"𝔩\",\"lg\":\"≶\",\"lgE\":\"⪑\",\"lHar\":\"⥢\",\"lhard\":\"↽\",\"lharu\":\"↼\",\"lharul\":\"⥪\",\"lhblk\":\"▄\",\"LJcy\":\"Љ\",\"ljcy\":\"љ\",\"llarr\":\"⇇\",\"ll\":\"≪\",\"Ll\":\"⋘\",\"llcorner\":\"⌞\",\"Lleftarrow\":\"⇚\",\"llhard\":\"⥫\",\"lltri\":\"◺\",\"Lmidot\":\"Ŀ\",\"lmidot\":\"ŀ\",\"lmoustache\":\"⎰\",\"lmoust\":\"⎰\",\"lnap\":\"⪉\",\"lnapprox\":\"⪉\",\"lne\":\"⪇\",\"lnE\":\"≨\",\"lneq\":\"⪇\",\"lneqq\":\"≨\",\"lnsim\":\"⋦\",\"loang\":\"⟬\",\"loarr\":\"⇽\",\"lobrk\":\"⟦\",\"longleftarrow\":\"⟵\",\"LongLeftArrow\":\"⟵\",\"Longleftarrow\":\"⟸\",\"longleftrightarrow\":\"⟷\",\"LongLeftRightArrow\":\"⟷\",\"Longleftrightarrow\":\"⟺\",\"longmapsto\":\"⟼\",\"longrightarrow\":\"⟶\",\"LongRightArrow\":\"⟶\",\"Longrightarrow\":\"⟹\",\"looparrowleft\":\"↫\",\"looparrowright\":\"↬\",\"lopar\":\"⦅\",\"Lopf\":\"𝕃\",\"lopf\":\"𝕝\",\"loplus\":\"⨭\",\"lotimes\":\"⨴\",\"lowast\":\"∗\",\"lowbar\":\"_\",\"LowerLeftArrow\":\"↙\",\"LowerRightArrow\":\"↘\",\"loz\":\"◊\",\"lozenge\":\"◊\",\"lozf\":\"⧫\",\"lpar\":\"(\",\"lparlt\":\"⦓\",\"lrarr\":\"⇆\",\"lrcorner\":\"⌟\",\"lrhar\":\"⇋\",\"lrhard\":\"⥭\",\"lrm\":\"‎\",\"lrtri\":\"⊿\",\"lsaquo\":\"‹\",\"lscr\":\"𝓁\",\"Lscr\":\"ℒ\",\"lsh\":\"↰\",\"Lsh\":\"↰\",\"lsim\":\"≲\",\"lsime\":\"⪍\",\"lsimg\":\"⪏\",\"lsqb\":\"[\",\"lsquo\":\"‘\",\"lsquor\":\"‚\",\"Lstrok\":\"Ł\",\"lstrok\":\"ł\",\"ltcc\":\"⪦\",\"ltcir\":\"⩹\",\"lt\":\"<\",\"LT\":\"<\",\"Lt\":\"≪\",\"ltdot\":\"⋖\",\"lthree\":\"⋋\",\"ltimes\":\"⋉\",\"ltlarr\":\"⥶\",\"ltquest\":\"⩻\",\"ltri\":\"◃\",\"ltrie\":\"⊴\",\"ltrif\":\"◂\",\"ltrPar\":\"⦖\",\"lurdshar\":\"⥊\",\"luruhar\":\"⥦\",\"lvertneqq\":\"≨︀\",\"lvnE\":\"≨︀\",\"macr\":\"¯\",\"male\":\"♂\",\"malt\":\"✠\",\"maltese\":\"✠\",\"Map\":\"⤅\",\"map\":\"↦\",\"mapsto\":\"↦\",\"mapstodown\":\"↧\",\"mapstoleft\":\"↤\",\"mapstoup\":\"↥\",\"marker\":\"▮\",\"mcomma\":\"⨩\",\"Mcy\":\"М\",\"mcy\":\"м\",\"mdash\":\"—\",\"mDDot\":\"∺\",\"measuredangle\":\"∡\",\"MediumSpace\":\" \",\"Mellintrf\":\"ℳ\",\"Mfr\":\"𝔐\",\"mfr\":\"𝔪\",\"mho\":\"℧\",\"micro\":\"µ\",\"midast\":\"*\",\"midcir\":\"⫰\",\"mid\":\"∣\",\"middot\":\"·\",\"minusb\":\"⊟\",\"minus\":\"−\",\"minusd\":\"∸\",\"minusdu\":\"⨪\",\"MinusPlus\":\"∓\",\"mlcp\":\"⫛\",\"mldr\":\"…\",\"mnplus\":\"∓\",\"models\":\"⊧\",\"Mopf\":\"𝕄\",\"mopf\":\"𝕞\",\"mp\":\"∓\",\"mscr\":\"𝓂\",\"Mscr\":\"ℳ\",\"mstpos\":\"∾\",\"Mu\":\"Μ\",\"mu\":\"μ\",\"multimap\":\"⊸\",\"mumap\":\"⊸\",\"nabla\":\"∇\",\"Nacute\":\"Ń\",\"nacute\":\"ń\",\"nang\":\"∠⃒\",\"nap\":\"≉\",\"napE\":\"⩰̸\",\"napid\":\"≋̸\",\"napos\":\"ŉ\",\"napprox\":\"≉\",\"natural\":\"♮\",\"naturals\":\"ℕ\",\"natur\":\"♮\",\"nbsp\":\" \",\"nbump\":\"≎̸\",\"nbumpe\":\"≏̸\",\"ncap\":\"⩃\",\"Ncaron\":\"Ň\",\"ncaron\":\"ň\",\"Ncedil\":\"Ņ\",\"ncedil\":\"ņ\",\"ncong\":\"≇\",\"ncongdot\":\"⩭̸\",\"ncup\":\"⩂\",\"Ncy\":\"Н\",\"ncy\":\"н\",\"ndash\":\"–\",\"nearhk\":\"⤤\",\"nearr\":\"↗\",\"neArr\":\"⇗\",\"nearrow\":\"↗\",\"ne\":\"≠\",\"nedot\":\"≐̸\",\"NegativeMediumSpace\":\"​\",\"NegativeThickSpace\":\"​\",\"NegativeThinSpace\":\"​\",\"NegativeVeryThinSpace\":\"​\",\"nequiv\":\"≢\",\"nesear\":\"⤨\",\"nesim\":\"≂̸\",\"NestedGreaterGreater\":\"≫\",\"NestedLessLess\":\"≪\",\"NewLine\":\"\\n\",\"nexist\":\"∄\",\"nexists\":\"∄\",\"Nfr\":\"𝔑\",\"nfr\":\"𝔫\",\"ngE\":\"≧̸\",\"nge\":\"≱\",\"ngeq\":\"≱\",\"ngeqq\":\"≧̸\",\"ngeqslant\":\"⩾̸\",\"nges\":\"⩾̸\",\"nGg\":\"⋙̸\",\"ngsim\":\"≵\",\"nGt\":\"≫⃒\",\"ngt\":\"≯\",\"ngtr\":\"≯\",\"nGtv\":\"≫̸\",\"nharr\":\"↮\",\"nhArr\":\"⇎\",\"nhpar\":\"⫲\",\"ni\":\"∋\",\"nis\":\"⋼\",\"nisd\":\"⋺\",\"niv\":\"∋\",\"NJcy\":\"Њ\",\"njcy\":\"њ\",\"nlarr\":\"↚\",\"nlArr\":\"⇍\",\"nldr\":\"‥\",\"nlE\":\"≦̸\",\"nle\":\"≰\",\"nleftarrow\":\"↚\",\"nLeftarrow\":\"⇍\",\"nleftrightarrow\":\"↮\",\"nLeftrightarrow\":\"⇎\",\"nleq\":\"≰\",\"nleqq\":\"≦̸\",\"nleqslant\":\"⩽̸\",\"nles\":\"⩽̸\",\"nless\":\"≮\",\"nLl\":\"⋘̸\",\"nlsim\":\"≴\",\"nLt\":\"≪⃒\",\"nlt\":\"≮\",\"nltri\":\"⋪\",\"nltrie\":\"⋬\",\"nLtv\":\"≪̸\",\"nmid\":\"∤\",\"NoBreak\":\"⁠\",\"NonBreakingSpace\":\" \",\"nopf\":\"𝕟\",\"Nopf\":\"ℕ\",\"Not\":\"⫬\",\"not\":\"¬\",\"NotCongruent\":\"≢\",\"NotCupCap\":\"≭\",\"NotDoubleVerticalBar\":\"∦\",\"NotElement\":\"∉\",\"NotEqual\":\"≠\",\"NotEqualTilde\":\"≂̸\",\"NotExists\":\"∄\",\"NotGreater\":\"≯\",\"NotGreaterEqual\":\"≱\",\"NotGreaterFullEqual\":\"≧̸\",\"NotGreaterGreater\":\"≫̸\",\"NotGreaterLess\":\"≹\",\"NotGreaterSlantEqual\":\"⩾̸\",\"NotGreaterTilde\":\"≵\",\"NotHumpDownHump\":\"≎̸\",\"NotHumpEqual\":\"≏̸\",\"notin\":\"∉\",\"notindot\":\"⋵̸\",\"notinE\":\"⋹̸\",\"notinva\":\"∉\",\"notinvb\":\"⋷\",\"notinvc\":\"⋶\",\"NotLeftTriangleBar\":\"⧏̸\",\"NotLeftTriangle\":\"⋪\",\"NotLeftTriangleEqual\":\"⋬\",\"NotLess\":\"≮\",\"NotLessEqual\":\"≰\",\"NotLessGreater\":\"≸\",\"NotLessLess\":\"≪̸\",\"NotLessSlantEqual\":\"⩽̸\",\"NotLessTilde\":\"≴\",\"NotNestedGreaterGreater\":\"⪢̸\",\"NotNestedLessLess\":\"⪡̸\",\"notni\":\"∌\",\"notniva\":\"∌\",\"notnivb\":\"⋾\",\"notnivc\":\"⋽\",\"NotPrecedes\":\"⊀\",\"NotPrecedesEqual\":\"⪯̸\",\"NotPrecedesSlantEqual\":\"⋠\",\"NotReverseElement\":\"∌\",\"NotRightTriangleBar\":\"⧐̸\",\"NotRightTriangle\":\"⋫\",\"NotRightTriangleEqual\":\"⋭\",\"NotSquareSubset\":\"⊏̸\",\"NotSquareSubsetEqual\":\"⋢\",\"NotSquareSuperset\":\"⊐̸\",\"NotSquareSupersetEqual\":\"⋣\",\"NotSubset\":\"⊂⃒\",\"NotSubsetEqual\":\"⊈\",\"NotSucceeds\":\"⊁\",\"NotSucceedsEqual\":\"⪰̸\",\"NotSucceedsSlantEqual\":\"⋡\",\"NotSucceedsTilde\":\"≿̸\",\"NotSuperset\":\"⊃⃒\",\"NotSupersetEqual\":\"⊉\",\"NotTilde\":\"≁\",\"NotTildeEqual\":\"≄\",\"NotTildeFullEqual\":\"≇\",\"NotTildeTilde\":\"≉\",\"NotVerticalBar\":\"∤\",\"nparallel\":\"∦\",\"npar\":\"∦\",\"nparsl\":\"⫽⃥\",\"npart\":\"∂̸\",\"npolint\":\"⨔\",\"npr\":\"⊀\",\"nprcue\":\"⋠\",\"nprec\":\"⊀\",\"npreceq\":\"⪯̸\",\"npre\":\"⪯̸\",\"nrarrc\":\"⤳̸\",\"nrarr\":\"↛\",\"nrArr\":\"⇏\",\"nrarrw\":\"↝̸\",\"nrightarrow\":\"↛\",\"nRightarrow\":\"⇏\",\"nrtri\":\"⋫\",\"nrtrie\":\"⋭\",\"nsc\":\"⊁\",\"nsccue\":\"⋡\",\"nsce\":\"⪰̸\",\"Nscr\":\"𝒩\",\"nscr\":\"𝓃\",\"nshortmid\":\"∤\",\"nshortparallel\":\"∦\",\"nsim\":\"≁\",\"nsime\":\"≄\",\"nsimeq\":\"≄\",\"nsmid\":\"∤\",\"nspar\":\"∦\",\"nsqsube\":\"⋢\",\"nsqsupe\":\"⋣\",\"nsub\":\"⊄\",\"nsubE\":\"⫅̸\",\"nsube\":\"⊈\",\"nsubset\":\"⊂⃒\",\"nsubseteq\":\"⊈\",\"nsubseteqq\":\"⫅̸\",\"nsucc\":\"⊁\",\"nsucceq\":\"⪰̸\",\"nsup\":\"⊅\",\"nsupE\":\"⫆̸\",\"nsupe\":\"⊉\",\"nsupset\":\"⊃⃒\",\"nsupseteq\":\"⊉\",\"nsupseteqq\":\"⫆̸\",\"ntgl\":\"≹\",\"Ntilde\":\"Ñ\",\"ntilde\":\"ñ\",\"ntlg\":\"≸\",\"ntriangleleft\":\"⋪\",\"ntrianglelefteq\":\"⋬\",\"ntriangleright\":\"⋫\",\"ntrianglerighteq\":\"⋭\",\"Nu\":\"Ν\",\"nu\":\"ν\",\"num\":\"#\",\"numero\":\"№\",\"numsp\":\" \",\"nvap\":\"≍⃒\",\"nvdash\":\"⊬\",\"nvDash\":\"⊭\",\"nVdash\":\"⊮\",\"nVDash\":\"⊯\",\"nvge\":\"≥⃒\",\"nvgt\":\">⃒\",\"nvHarr\":\"⤄\",\"nvinfin\":\"⧞\",\"nvlArr\":\"⤂\",\"nvle\":\"≤⃒\",\"nvlt\":\"<⃒\",\"nvltrie\":\"⊴⃒\",\"nvrArr\":\"⤃\",\"nvrtrie\":\"⊵⃒\",\"nvsim\":\"∼⃒\",\"nwarhk\":\"⤣\",\"nwarr\":\"↖\",\"nwArr\":\"⇖\",\"nwarrow\":\"↖\",\"nwnear\":\"⤧\",\"Oacute\":\"Ó\",\"oacute\":\"ó\",\"oast\":\"⊛\",\"Ocirc\":\"Ô\",\"ocirc\":\"ô\",\"ocir\":\"⊚\",\"Ocy\":\"О\",\"ocy\":\"о\",\"odash\":\"⊝\",\"Odblac\":\"Ő\",\"odblac\":\"ő\",\"odiv\":\"⨸\",\"odot\":\"⊙\",\"odsold\":\"⦼\",\"OElig\":\"Œ\",\"oelig\":\"œ\",\"ofcir\":\"⦿\",\"Ofr\":\"𝔒\",\"ofr\":\"𝔬\",\"ogon\":\"˛\",\"Ograve\":\"Ò\",\"ograve\":\"ò\",\"ogt\":\"⧁\",\"ohbar\":\"⦵\",\"ohm\":\"Ω\",\"oint\":\"∮\",\"olarr\":\"↺\",\"olcir\":\"⦾\",\"olcross\":\"⦻\",\"oline\":\"‾\",\"olt\":\"⧀\",\"Omacr\":\"Ō\",\"omacr\":\"ō\",\"Omega\":\"Ω\",\"omega\":\"ω\",\"Omicron\":\"Ο\",\"omicron\":\"ο\",\"omid\":\"⦶\",\"ominus\":\"⊖\",\"Oopf\":\"𝕆\",\"oopf\":\"𝕠\",\"opar\":\"⦷\",\"OpenCurlyDoubleQuote\":\"“\",\"OpenCurlyQuote\":\"‘\",\"operp\":\"⦹\",\"oplus\":\"⊕\",\"orarr\":\"↻\",\"Or\":\"⩔\",\"or\":\"∨\",\"ord\":\"⩝\",\"order\":\"ℴ\",\"orderof\":\"ℴ\",\"ordf\":\"ª\",\"ordm\":\"º\",\"origof\":\"⊶\",\"oror\":\"⩖\",\"orslope\":\"⩗\",\"orv\":\"⩛\",\"oS\":\"Ⓢ\",\"Oscr\":\"𝒪\",\"oscr\":\"ℴ\",\"Oslash\":\"Ø\",\"oslash\":\"ø\",\"osol\":\"⊘\",\"Otilde\":\"Õ\",\"otilde\":\"õ\",\"otimesas\":\"⨶\",\"Otimes\":\"⨷\",\"otimes\":\"⊗\",\"Ouml\":\"Ö\",\"ouml\":\"ö\",\"ovbar\":\"⌽\",\"OverBar\":\"‾\",\"OverBrace\":\"⏞\",\"OverBracket\":\"⎴\",\"OverParenthesis\":\"⏜\",\"para\":\"¶\",\"parallel\":\"∥\",\"par\":\"∥\",\"parsim\":\"⫳\",\"parsl\":\"⫽\",\"part\":\"∂\",\"PartialD\":\"∂\",\"Pcy\":\"П\",\"pcy\":\"п\",\"percnt\":\"%\",\"period\":\".\",\"permil\":\"‰\",\"perp\":\"⊥\",\"pertenk\":\"‱\",\"Pfr\":\"𝔓\",\"pfr\":\"𝔭\",\"Phi\":\"Φ\",\"phi\":\"φ\",\"phiv\":\"ϕ\",\"phmmat\":\"ℳ\",\"phone\":\"☎\",\"Pi\":\"Π\",\"pi\":\"π\",\"pitchfork\":\"⋔\",\"piv\":\"ϖ\",\"planck\":\"ℏ\",\"planckh\":\"ℎ\",\"plankv\":\"ℏ\",\"plusacir\":\"⨣\",\"plusb\":\"⊞\",\"pluscir\":\"⨢\",\"plus\":\"+\",\"plusdo\":\"∔\",\"plusdu\":\"⨥\",\"pluse\":\"⩲\",\"PlusMinus\":\"±\",\"plusmn\":\"±\",\"plussim\":\"⨦\",\"plustwo\":\"⨧\",\"pm\":\"±\",\"Poincareplane\":\"ℌ\",\"pointint\":\"⨕\",\"popf\":\"𝕡\",\"Popf\":\"ℙ\",\"pound\":\"£\",\"prap\":\"⪷\",\"Pr\":\"⪻\",\"pr\":\"≺\",\"prcue\":\"≼\",\"precapprox\":\"⪷\",\"prec\":\"≺\",\"preccurlyeq\":\"≼\",\"Precedes\":\"≺\",\"PrecedesEqual\":\"⪯\",\"PrecedesSlantEqual\":\"≼\",\"PrecedesTilde\":\"≾\",\"preceq\":\"⪯\",\"precnapprox\":\"⪹\",\"precneqq\":\"⪵\",\"precnsim\":\"⋨\",\"pre\":\"⪯\",\"prE\":\"⪳\",\"precsim\":\"≾\",\"prime\":\"′\",\"Prime\":\"″\",\"primes\":\"ℙ\",\"prnap\":\"⪹\",\"prnE\":\"⪵\",\"prnsim\":\"⋨\",\"prod\":\"∏\",\"Product\":\"∏\",\"profalar\":\"⌮\",\"profline\":\"⌒\",\"profsurf\":\"⌓\",\"prop\":\"∝\",\"Proportional\":\"∝\",\"Proportion\":\"∷\",\"propto\":\"∝\",\"prsim\":\"≾\",\"prurel\":\"⊰\",\"Pscr\":\"𝒫\",\"pscr\":\"𝓅\",\"Psi\":\"Ψ\",\"psi\":\"ψ\",\"puncsp\":\" \",\"Qfr\":\"𝔔\",\"qfr\":\"𝔮\",\"qint\":\"⨌\",\"qopf\":\"𝕢\",\"Qopf\":\"ℚ\",\"qprime\":\"⁗\",\"Qscr\":\"𝒬\",\"qscr\":\"𝓆\",\"quaternions\":\"ℍ\",\"quatint\":\"⨖\",\"quest\":\"?\",\"questeq\":\"≟\",\"quot\":\"\\\"\",\"QUOT\":\"\\\"\",\"rAarr\":\"⇛\",\"race\":\"∽̱\",\"Racute\":\"Ŕ\",\"racute\":\"ŕ\",\"radic\":\"√\",\"raemptyv\":\"⦳\",\"rang\":\"⟩\",\"Rang\":\"⟫\",\"rangd\":\"⦒\",\"range\":\"⦥\",\"rangle\":\"⟩\",\"raquo\":\"»\",\"rarrap\":\"⥵\",\"rarrb\":\"⇥\",\"rarrbfs\":\"⤠\",\"rarrc\":\"⤳\",\"rarr\":\"→\",\"Rarr\":\"↠\",\"rArr\":\"⇒\",\"rarrfs\":\"⤞\",\"rarrhk\":\"↪\",\"rarrlp\":\"↬\",\"rarrpl\":\"⥅\",\"rarrsim\":\"⥴\",\"Rarrtl\":\"⤖\",\"rarrtl\":\"↣\",\"rarrw\":\"↝\",\"ratail\":\"⤚\",\"rAtail\":\"⤜\",\"ratio\":\"∶\",\"rationals\":\"ℚ\",\"rbarr\":\"⤍\",\"rBarr\":\"⤏\",\"RBarr\":\"⤐\",\"rbbrk\":\"❳\",\"rbrace\":\"}\",\"rbrack\":\"]\",\"rbrke\":\"⦌\",\"rbrksld\":\"⦎\",\"rbrkslu\":\"⦐\",\"Rcaron\":\"Ř\",\"rcaron\":\"ř\",\"Rcedil\":\"Ŗ\",\"rcedil\":\"ŗ\",\"rceil\":\"⌉\",\"rcub\":\"}\",\"Rcy\":\"Р\",\"rcy\":\"р\",\"rdca\":\"⤷\",\"rdldhar\":\"⥩\",\"rdquo\":\"”\",\"rdquor\":\"”\",\"rdsh\":\"↳\",\"real\":\"ℜ\",\"realine\":\"ℛ\",\"realpart\":\"ℜ\",\"reals\":\"ℝ\",\"Re\":\"ℜ\",\"rect\":\"▭\",\"reg\":\"®\",\"REG\":\"®\",\"ReverseElement\":\"∋\",\"ReverseEquilibrium\":\"⇋\",\"ReverseUpEquilibrium\":\"⥯\",\"rfisht\":\"⥽\",\"rfloor\":\"⌋\",\"rfr\":\"𝔯\",\"Rfr\":\"ℜ\",\"rHar\":\"⥤\",\"rhard\":\"⇁\",\"rharu\":\"⇀\",\"rharul\":\"⥬\",\"Rho\":\"Ρ\",\"rho\":\"ρ\",\"rhov\":\"ϱ\",\"RightAngleBracket\":\"⟩\",\"RightArrowBar\":\"⇥\",\"rightarrow\":\"→\",\"RightArrow\":\"→\",\"Rightarrow\":\"⇒\",\"RightArrowLeftArrow\":\"⇄\",\"rightarrowtail\":\"↣\",\"RightCeiling\":\"⌉\",\"RightDoubleBracket\":\"⟧\",\"RightDownTeeVector\":\"⥝\",\"RightDownVectorBar\":\"⥕\",\"RightDownVector\":\"⇂\",\"RightFloor\":\"⌋\",\"rightharpoondown\":\"⇁\",\"rightharpoonup\":\"⇀\",\"rightleftarrows\":\"⇄\",\"rightleftharpoons\":\"⇌\",\"rightrightarrows\":\"⇉\",\"rightsquigarrow\":\"↝\",\"RightTeeArrow\":\"↦\",\"RightTee\":\"⊢\",\"RightTeeVector\":\"⥛\",\"rightthreetimes\":\"⋌\",\"RightTriangleBar\":\"⧐\",\"RightTriangle\":\"⊳\",\"RightTriangleEqual\":\"⊵\",\"RightUpDownVector\":\"⥏\",\"RightUpTeeVector\":\"⥜\",\"RightUpVectorBar\":\"⥔\",\"RightUpVector\":\"↾\",\"RightVectorBar\":\"⥓\",\"RightVector\":\"⇀\",\"ring\":\"˚\",\"risingdotseq\":\"≓\",\"rlarr\":\"⇄\",\"rlhar\":\"⇌\",\"rlm\":\"‏\",\"rmoustache\":\"⎱\",\"rmoust\":\"⎱\",\"rnmid\":\"⫮\",\"roang\":\"⟭\",\"roarr\":\"⇾\",\"robrk\":\"⟧\",\"ropar\":\"⦆\",\"ropf\":\"𝕣\",\"Ropf\":\"ℝ\",\"roplus\":\"⨮\",\"rotimes\":\"⨵\",\"RoundImplies\":\"⥰\",\"rpar\":\")\",\"rpargt\":\"⦔\",\"rppolint\":\"⨒\",\"rrarr\":\"⇉\",\"Rrightarrow\":\"⇛\",\"rsaquo\":\"›\",\"rscr\":\"𝓇\",\"Rscr\":\"ℛ\",\"rsh\":\"↱\",\"Rsh\":\"↱\",\"rsqb\":\"]\",\"rsquo\":\"’\",\"rsquor\":\"’\",\"rthree\":\"⋌\",\"rtimes\":\"⋊\",\"rtri\":\"▹\",\"rtrie\":\"⊵\",\"rtrif\":\"▸\",\"rtriltri\":\"⧎\",\"RuleDelayed\":\"⧴\",\"ruluhar\":\"⥨\",\"rx\":\"℞\",\"Sacute\":\"Ś\",\"sacute\":\"ś\",\"sbquo\":\"‚\",\"scap\":\"⪸\",\"Scaron\":\"Š\",\"scaron\":\"š\",\"Sc\":\"⪼\",\"sc\":\"≻\",\"sccue\":\"≽\",\"sce\":\"⪰\",\"scE\":\"⪴\",\"Scedil\":\"Ş\",\"scedil\":\"ş\",\"Scirc\":\"Ŝ\",\"scirc\":\"ŝ\",\"scnap\":\"⪺\",\"scnE\":\"⪶\",\"scnsim\":\"⋩\",\"scpolint\":\"⨓\",\"scsim\":\"≿\",\"Scy\":\"С\",\"scy\":\"с\",\"sdotb\":\"⊡\",\"sdot\":\"⋅\",\"sdote\":\"⩦\",\"searhk\":\"⤥\",\"searr\":\"↘\",\"seArr\":\"⇘\",\"searrow\":\"↘\",\"sect\":\"§\",\"semi\":\";\",\"seswar\":\"⤩\",\"setminus\":\"∖\",\"setmn\":\"∖\",\"sext\":\"✶\",\"Sfr\":\"𝔖\",\"sfr\":\"𝔰\",\"sfrown\":\"⌢\",\"sharp\":\"♯\",\"SHCHcy\":\"Щ\",\"shchcy\":\"щ\",\"SHcy\":\"Ш\",\"shcy\":\"ш\",\"ShortDownArrow\":\"↓\",\"ShortLeftArrow\":\"←\",\"shortmid\":\"∣\",\"shortparallel\":\"∥\",\"ShortRightArrow\":\"→\",\"ShortUpArrow\":\"↑\",\"shy\":\"­\",\"Sigma\":\"Σ\",\"sigma\":\"σ\",\"sigmaf\":\"ς\",\"sigmav\":\"ς\",\"sim\":\"∼\",\"simdot\":\"⩪\",\"sime\":\"≃\",\"simeq\":\"≃\",\"simg\":\"⪞\",\"simgE\":\"⪠\",\"siml\":\"⪝\",\"simlE\":\"⪟\",\"simne\":\"≆\",\"simplus\":\"⨤\",\"simrarr\":\"⥲\",\"slarr\":\"←\",\"SmallCircle\":\"∘\",\"smallsetminus\":\"∖\",\"smashp\":\"⨳\",\"smeparsl\":\"⧤\",\"smid\":\"∣\",\"smile\":\"⌣\",\"smt\":\"⪪\",\"smte\":\"⪬\",\"smtes\":\"⪬︀\",\"SOFTcy\":\"Ь\",\"softcy\":\"ь\",\"solbar\":\"⌿\",\"solb\":\"⧄\",\"sol\":\"/\",\"Sopf\":\"𝕊\",\"sopf\":\"𝕤\",\"spades\":\"♠\",\"spadesuit\":\"♠\",\"spar\":\"∥\",\"sqcap\":\"⊓\",\"sqcaps\":\"⊓︀\",\"sqcup\":\"⊔\",\"sqcups\":\"⊔︀\",\"Sqrt\":\"√\",\"sqsub\":\"⊏\",\"sqsube\":\"⊑\",\"sqsubset\":\"⊏\",\"sqsubseteq\":\"⊑\",\"sqsup\":\"⊐\",\"sqsupe\":\"⊒\",\"sqsupset\":\"⊐\",\"sqsupseteq\":\"⊒\",\"square\":\"□\",\"Square\":\"□\",\"SquareIntersection\":\"⊓\",\"SquareSubset\":\"⊏\",\"SquareSubsetEqual\":\"⊑\",\"SquareSuperset\":\"⊐\",\"SquareSupersetEqual\":\"⊒\",\"SquareUnion\":\"⊔\",\"squarf\":\"▪\",\"squ\":\"□\",\"squf\":\"▪\",\"srarr\":\"→\",\"Sscr\":\"𝒮\",\"sscr\":\"𝓈\",\"ssetmn\":\"∖\",\"ssmile\":\"⌣\",\"sstarf\":\"⋆\",\"Star\":\"⋆\",\"star\":\"☆\",\"starf\":\"★\",\"straightepsilon\":\"ϵ\",\"straightphi\":\"ϕ\",\"strns\":\"¯\",\"sub\":\"⊂\",\"Sub\":\"⋐\",\"subdot\":\"⪽\",\"subE\":\"⫅\",\"sube\":\"⊆\",\"subedot\":\"⫃\",\"submult\":\"⫁\",\"subnE\":\"⫋\",\"subne\":\"⊊\",\"subplus\":\"⪿\",\"subrarr\":\"⥹\",\"subset\":\"⊂\",\"Subset\":\"⋐\",\"subseteq\":\"⊆\",\"subseteqq\":\"⫅\",\"SubsetEqual\":\"⊆\",\"subsetneq\":\"⊊\",\"subsetneqq\":\"⫋\",\"subsim\":\"⫇\",\"subsub\":\"⫕\",\"subsup\":\"⫓\",\"succapprox\":\"⪸\",\"succ\":\"≻\",\"succcurlyeq\":\"≽\",\"Succeeds\":\"≻\",\"SucceedsEqual\":\"⪰\",\"SucceedsSlantEqual\":\"≽\",\"SucceedsTilde\":\"≿\",\"succeq\":\"⪰\",\"succnapprox\":\"⪺\",\"succneqq\":\"⪶\",\"succnsim\":\"⋩\",\"succsim\":\"≿\",\"SuchThat\":\"∋\",\"sum\":\"∑\",\"Sum\":\"∑\",\"sung\":\"♪\",\"sup1\":\"¹\",\"sup2\":\"²\",\"sup3\":\"³\",\"sup\":\"⊃\",\"Sup\":\"⋑\",\"supdot\":\"⪾\",\"supdsub\":\"⫘\",\"supE\":\"⫆\",\"supe\":\"⊇\",\"supedot\":\"⫄\",\"Superset\":\"⊃\",\"SupersetEqual\":\"⊇\",\"suphsol\":\"⟉\",\"suphsub\":\"⫗\",\"suplarr\":\"⥻\",\"supmult\":\"⫂\",\"supnE\":\"⫌\",\"supne\":\"⊋\",\"supplus\":\"⫀\",\"supset\":\"⊃\",\"Supset\":\"⋑\",\"supseteq\":\"⊇\",\"supseteqq\":\"⫆\",\"supsetneq\":\"⊋\",\"supsetneqq\":\"⫌\",\"supsim\":\"⫈\",\"supsub\":\"⫔\",\"supsup\":\"⫖\",\"swarhk\":\"⤦\",\"swarr\":\"↙\",\"swArr\":\"⇙\",\"swarrow\":\"↙\",\"swnwar\":\"⤪\",\"szlig\":\"ß\",\"Tab\":\"\\t\",\"target\":\"⌖\",\"Tau\":\"Τ\",\"tau\":\"τ\",\"tbrk\":\"⎴\",\"Tcaron\":\"Ť\",\"tcaron\":\"ť\",\"Tcedil\":\"Ţ\",\"tcedil\":\"ţ\",\"Tcy\":\"Т\",\"tcy\":\"т\",\"tdot\":\"⃛\",\"telrec\":\"⌕\",\"Tfr\":\"𝔗\",\"tfr\":\"𝔱\",\"there4\":\"∴\",\"therefore\":\"∴\",\"Therefore\":\"∴\",\"Theta\":\"Θ\",\"theta\":\"θ\",\"thetasym\":\"ϑ\",\"thetav\":\"ϑ\",\"thickapprox\":\"≈\",\"thicksim\":\"∼\",\"ThickSpace\":\"  \",\"ThinSpace\":\" \",\"thinsp\":\" \",\"thkap\":\"≈\",\"thksim\":\"∼\",\"THORN\":\"Þ\",\"thorn\":\"þ\",\"tilde\":\"˜\",\"Tilde\":\"∼\",\"TildeEqual\":\"≃\",\"TildeFullEqual\":\"≅\",\"TildeTilde\":\"≈\",\"timesbar\":\"⨱\",\"timesb\":\"⊠\",\"times\":\"×\",\"timesd\":\"⨰\",\"tint\":\"∭\",\"toea\":\"⤨\",\"topbot\":\"⌶\",\"topcir\":\"⫱\",\"top\":\"⊤\",\"Topf\":\"𝕋\",\"topf\":\"𝕥\",\"topfork\":\"⫚\",\"tosa\":\"⤩\",\"tprime\":\"‴\",\"trade\":\"™\",\"TRADE\":\"™\",\"triangle\":\"▵\",\"triangledown\":\"▿\",\"triangleleft\":\"◃\",\"trianglelefteq\":\"⊴\",\"triangleq\":\"≜\",\"triangleright\":\"▹\",\"trianglerighteq\":\"⊵\",\"tridot\":\"◬\",\"trie\":\"≜\",\"triminus\":\"⨺\",\"TripleDot\":\"⃛\",\"triplus\":\"⨹\",\"trisb\":\"⧍\",\"tritime\":\"⨻\",\"trpezium\":\"⏢\",\"Tscr\":\"𝒯\",\"tscr\":\"𝓉\",\"TScy\":\"Ц\",\"tscy\":\"ц\",\"TSHcy\":\"Ћ\",\"tshcy\":\"ћ\",\"Tstrok\":\"Ŧ\",\"tstrok\":\"ŧ\",\"twixt\":\"≬\",\"twoheadleftarrow\":\"↞\",\"twoheadrightarrow\":\"↠\",\"Uacute\":\"Ú\",\"uacute\":\"ú\",\"uarr\":\"↑\",\"Uarr\":\"↟\",\"uArr\":\"⇑\",\"Uarrocir\":\"⥉\",\"Ubrcy\":\"Ў\",\"ubrcy\":\"ў\",\"Ubreve\":\"Ŭ\",\"ubreve\":\"ŭ\",\"Ucirc\":\"Û\",\"ucirc\":\"û\",\"Ucy\":\"У\",\"ucy\":\"у\",\"udarr\":\"⇅\",\"Udblac\":\"Ű\",\"udblac\":\"ű\",\"udhar\":\"⥮\",\"ufisht\":\"⥾\",\"Ufr\":\"𝔘\",\"ufr\":\"𝔲\",\"Ugrave\":\"Ù\",\"ugrave\":\"ù\",\"uHar\":\"⥣\",\"uharl\":\"↿\",\"uharr\":\"↾\",\"uhblk\":\"▀\",\"ulcorn\":\"⌜\",\"ulcorner\":\"⌜\",\"ulcrop\":\"⌏\",\"ultri\":\"◸\",\"Umacr\":\"Ū\",\"umacr\":\"ū\",\"uml\":\"¨\",\"UnderBar\":\"_\",\"UnderBrace\":\"⏟\",\"UnderBracket\":\"⎵\",\"UnderParenthesis\":\"⏝\",\"Union\":\"⋃\",\"UnionPlus\":\"⊎\",\"Uogon\":\"Ų\",\"uogon\":\"ų\",\"Uopf\":\"𝕌\",\"uopf\":\"𝕦\",\"UpArrowBar\":\"⤒\",\"uparrow\":\"↑\",\"UpArrow\":\"↑\",\"Uparrow\":\"⇑\",\"UpArrowDownArrow\":\"⇅\",\"updownarrow\":\"↕\",\"UpDownArrow\":\"↕\",\"Updownarrow\":\"⇕\",\"UpEquilibrium\":\"⥮\",\"upharpoonleft\":\"↿\",\"upharpoonright\":\"↾\",\"uplus\":\"⊎\",\"UpperLeftArrow\":\"↖\",\"UpperRightArrow\":\"↗\",\"upsi\":\"υ\",\"Upsi\":\"ϒ\",\"upsih\":\"ϒ\",\"Upsilon\":\"Υ\",\"upsilon\":\"υ\",\"UpTeeArrow\":\"↥\",\"UpTee\":\"⊥\",\"upuparrows\":\"⇈\",\"urcorn\":\"⌝\",\"urcorner\":\"⌝\",\"urcrop\":\"⌎\",\"Uring\":\"Ů\",\"uring\":\"ů\",\"urtri\":\"◹\",\"Uscr\":\"𝒰\",\"uscr\":\"𝓊\",\"utdot\":\"⋰\",\"Utilde\":\"Ũ\",\"utilde\":\"ũ\",\"utri\":\"▵\",\"utrif\":\"▴\",\"uuarr\":\"⇈\",\"Uuml\":\"Ü\",\"uuml\":\"ü\",\"uwangle\":\"⦧\",\"vangrt\":\"⦜\",\"varepsilon\":\"ϵ\",\"varkappa\":\"ϰ\",\"varnothing\":\"∅\",\"varphi\":\"ϕ\",\"varpi\":\"ϖ\",\"varpropto\":\"∝\",\"varr\":\"↕\",\"vArr\":\"⇕\",\"varrho\":\"ϱ\",\"varsigma\":\"ς\",\"varsubsetneq\":\"⊊︀\",\"varsubsetneqq\":\"⫋︀\",\"varsupsetneq\":\"⊋︀\",\"varsupsetneqq\":\"⫌︀\",\"vartheta\":\"ϑ\",\"vartriangleleft\":\"⊲\",\"vartriangleright\":\"⊳\",\"vBar\":\"⫨\",\"Vbar\":\"⫫\",\"vBarv\":\"⫩\",\"Vcy\":\"В\",\"vcy\":\"в\",\"vdash\":\"⊢\",\"vDash\":\"⊨\",\"Vdash\":\"⊩\",\"VDash\":\"⊫\",\"Vdashl\":\"⫦\",\"veebar\":\"⊻\",\"vee\":\"∨\",\"Vee\":\"⋁\",\"veeeq\":\"≚\",\"vellip\":\"⋮\",\"verbar\":\"|\",\"Verbar\":\"‖\",\"vert\":\"|\",\"Vert\":\"‖\",\"VerticalBar\":\"∣\",\"VerticalLine\":\"|\",\"VerticalSeparator\":\"❘\",\"VerticalTilde\":\"≀\",\"VeryThinSpace\":\" \",\"Vfr\":\"𝔙\",\"vfr\":\"𝔳\",\"vltri\":\"⊲\",\"vnsub\":\"⊂⃒\",\"vnsup\":\"⊃⃒\",\"Vopf\":\"𝕍\",\"vopf\":\"𝕧\",\"vprop\":\"∝\",\"vrtri\":\"⊳\",\"Vscr\":\"𝒱\",\"vscr\":\"𝓋\",\"vsubnE\":\"⫋︀\",\"vsubne\":\"⊊︀\",\"vsupnE\":\"⫌︀\",\"vsupne\":\"⊋︀\",\"Vvdash\":\"⊪\",\"vzigzag\":\"⦚\",\"Wcirc\":\"Ŵ\",\"wcirc\":\"ŵ\",\"wedbar\":\"⩟\",\"wedge\":\"∧\",\"Wedge\":\"⋀\",\"wedgeq\":\"≙\",\"weierp\":\"℘\",\"Wfr\":\"𝔚\",\"wfr\":\"𝔴\",\"Wopf\":\"𝕎\",\"wopf\":\"𝕨\",\"wp\":\"℘\",\"wr\":\"≀\",\"wreath\":\"≀\",\"Wscr\":\"𝒲\",\"wscr\":\"𝓌\",\"xcap\":\"⋂\",\"xcirc\":\"◯\",\"xcup\":\"⋃\",\"xdtri\":\"▽\",\"Xfr\":\"𝔛\",\"xfr\":\"𝔵\",\"xharr\":\"⟷\",\"xhArr\":\"⟺\",\"Xi\":\"Ξ\",\"xi\":\"ξ\",\"xlarr\":\"⟵\",\"xlArr\":\"⟸\",\"xmap\":\"⟼\",\"xnis\":\"⋻\",\"xodot\":\"⨀\",\"Xopf\":\"𝕏\",\"xopf\":\"𝕩\",\"xoplus\":\"⨁\",\"xotime\":\"⨂\",\"xrarr\":\"⟶\",\"xrArr\":\"⟹\",\"Xscr\":\"𝒳\",\"xscr\":\"𝓍\",\"xsqcup\":\"⨆\",\"xuplus\":\"⨄\",\"xutri\":\"△\",\"xvee\":\"⋁\",\"xwedge\":\"⋀\",\"Yacute\":\"Ý\",\"yacute\":\"ý\",\"YAcy\":\"Я\",\"yacy\":\"я\",\"Ycirc\":\"Ŷ\",\"ycirc\":\"ŷ\",\"Ycy\":\"Ы\",\"ycy\":\"ы\",\"yen\":\"¥\",\"Yfr\":\"𝔜\",\"yfr\":\"𝔶\",\"YIcy\":\"Ї\",\"yicy\":\"ї\",\"Yopf\":\"𝕐\",\"yopf\":\"𝕪\",\"Yscr\":\"𝒴\",\"yscr\":\"𝓎\",\"YUcy\":\"Ю\",\"yucy\":\"ю\",\"yuml\":\"ÿ\",\"Yuml\":\"Ÿ\",\"Zacute\":\"Ź\",\"zacute\":\"ź\",\"Zcaron\":\"Ž\",\"zcaron\":\"ž\",\"Zcy\":\"З\",\"zcy\":\"з\",\"Zdot\":\"Ż\",\"zdot\":\"ż\",\"zeetrf\":\"ℨ\",\"ZeroWidthSpace\":\"​\",\"Zeta\":\"Ζ\",\"zeta\":\"ζ\",\"zfr\":\"𝔷\",\"Zfr\":\"ℨ\",\"ZHcy\":\"Ж\",\"zhcy\":\"ж\",\"zigrarr\":\"⇝\",\"zopf\":\"𝕫\",\"Zopf\":\"ℤ\",\"Zscr\":\"𝒵\",\"zscr\":\"𝓏\",\"zwj\":\"‍\",\"zwnj\":\"‌\"}"));}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/maps/legacy.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"Aacute":"Á","aacute":"á","Acirc":"Â","acirc":"â","acute":"´","AElig":"Æ","aelig":"æ","Agrave":"À","agrave":"à","amp":"&","AMP":"&","Aring":"Å","aring":"å","Atilde":"Ã","atilde":"ã","Auml":"Ä","auml":"ä","brvbar":"¦","Ccedil":"Ç","ccedil":"ç","cedil":"¸","cent":"¢","copy":"©","COPY":"©","curren":"¤","deg":"°","divide":"÷","Eacute":"É","eacute":"é","Ecirc":"Ê","ecirc":"ê","Egrave":"È","egrave":"è","ETH":"Ð","eth":"ð","Euml":"Ë","euml":"ë","frac12":"½","frac14":"¼","frac34":"¾","gt":">","GT":">","Iacute":"Í","iacute":"í","Icirc":"Î","icirc":"î","iexcl":"¡","Igrave":"Ì","igrave":"ì","iquest":"¿","Iuml":"Ï","iuml":"ï","laquo":"«","lt":"<","LT":"<","macr":"¯","micro":"µ","middot":"·","nbsp":" ","not":"¬","Ntilde":"Ñ","ntilde":"ñ","Oacute":"Ó","oacute":"ó","Ocirc":"Ô","ocirc":"ô","Ograve":"Ò","ograve":"ò","ordf":"ª","ordm":"º","Oslash":"Ø","oslash":"ø","Otilde":"Õ","otilde":"õ","Ouml":"Ö","ouml":"ö","para":"¶","plusmn":"±","pound":"£","quot":"\"","QUOT":"\"","raquo":"»","reg":"®","REG":"®","sect":"§","shy":"­","sup1":"¹","sup2":"²","sup3":"³","szlig":"ß","THORN":"Þ","thorn":"þ","times":"×","Uacute":"Ú","uacute":"ú","Ucirc":"Û","ucirc":"û","Ugrave":"Ù","ugrave":"ù","uml":"¨","Uuml":"Ü","uuml":"ü","Yacute":"Ý","yacute":"ý","yen":"¥","yuml":"ÿ"});}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/maps/xml.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"amp":"&","apos":"'","gt":">","lt":"<","quot":"\""});}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/encode.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __importDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.escapeUTF8 = exports.escape = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.encodeXML = void 0;
var xml_json_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/maps/xml.json (json)"));
var inverseXML = getInverseObj(xml_json_1.default);
var xmlReplacer = getInverseReplacer(inverseXML);
/**
 * Encodes all non-ASCII characters, as well as characters not valid in XML
 * documents using XML entities.
 *
 * If a character has no equivalent entity, a
 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
 */ exports.encodeXML = getASCIIEncoder(inverseXML);
var entities_json_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/maps/entities.json (json)"));
var inverseHTML = getInverseObj(entities_json_1.default);
var htmlReplacer = getInverseReplacer(inverseHTML);
/**
 * Encodes all entities and non-ASCII characters in the input.
 *
 * This includes characters that are valid ASCII characters in HTML documents.
 * For example `#` will be encoded as `&num;`. To get a more compact output,
 * consider using the `encodeNonAsciiHTML` function.
 *
 * If a character has no equivalent entity, a
 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
 */ exports.encodeHTML = getInverse(inverseHTML, htmlReplacer);
/**
 * Encodes all non-ASCII characters, as well as characters not valid in HTML
 * documents using HTML entities.
 *
 * If a character has no equivalent entity, a
 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
 */ exports.encodeNonAsciiHTML = getASCIIEncoder(inverseHTML);
function getInverseObj(obj) {
    return Object.keys(obj).sort().reduce(function(inverse, name) {
        inverse[obj[name]] = "&" + name + ";";
        return inverse;
    }, {});
}
function getInverseReplacer(inverse) {
    var single = [];
    var multiple = [];
    for(var _i = 0, _a = Object.keys(inverse); _i < _a.length; _i++){
        var k = _a[_i];
        if (k.length === 1) {
            // Add value to single array
            single.push("\\" + k);
        } else {
            // Add value to multiple array
            multiple.push(k);
        }
    }
    // Add ranges to single characters.
    single.sort();
    for(var start = 0; start < single.length - 1; start++){
        // Find the end of a run of characters
        var end = start;
        while(end < single.length - 1 && single[end].charCodeAt(1) + 1 === single[end + 1].charCodeAt(1)){
            end += 1;
        }
        var count = 1 + end - start;
        // We want to replace at least three characters
        if (count < 3) continue;
        single.splice(start, count, single[start] + "-" + single[end]);
    }
    multiple.unshift("[" + single.join("") + "]");
    return new RegExp(multiple.join("|"), "g");
}
// /[^\0-\x7F]/gu
var reNonASCII = /(?:[\x80-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g;
var getCodePoint = // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
String.prototype.codePointAt != null ? function(str) {
    return str.codePointAt(0);
} : function(c) {
    return (c.charCodeAt(0) - 0xd800) * 0x400 + c.charCodeAt(1) - 0xdc00 + 0x10000;
};
function singleCharReplacer(c) {
    return "&#x" + (c.length > 1 ? getCodePoint(c) : c.charCodeAt(0)).toString(16).toUpperCase() + ";";
}
function getInverse(inverse, re) {
    return function(data) {
        return data.replace(re, function(name) {
            return inverse[name];
        }).replace(reNonASCII, singleCharReplacer);
    };
}
var reEscapeChars = new RegExp(xmlReplacer.source + "|" + reNonASCII.source, "g");
/**
 * Encodes all non-ASCII characters, as well as characters not valid in XML
 * documents using numeric hexadecimal reference (eg. `&#xfc;`).
 *
 * Have a look at `escapeUTF8` if you want a more concise output at the expense
 * of reduced transportability.
 *
 * @param data String to escape.
 */ function escape(data) {
    return data.replace(reEscapeChars, singleCharReplacer);
}
exports.escape = escape;
/**
 * Encodes all characters not valid in XML documents using numeric hexadecimal
 * reference (eg. `&#xfc;`).
 *
 * Note that the output will be character-set dependent.
 *
 * @param data String to escape.
 */ function escapeUTF8(data) {
    return data.replace(xmlReplacer, singleCharReplacer);
}
exports.escapeUTF8 = escapeUTF8;
function getASCIIEncoder(obj) {
    return function(data) {
        return data.replace(reEscapeChars, function(c) {
            return obj[c] || singleCharReplacer(c);
        });
    };
}
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/decode.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __importDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.decodeHTML = exports.decodeHTMLStrict = exports.decodeXML = void 0;
var entities_json_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/maps/entities.json (json)"));
var legacy_json_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/maps/legacy.json (json)"));
var xml_json_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/maps/xml.json (json)"));
var decode_codepoint_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/decode_codepoint.js [app-route] (ecmascript)"));
var strictEntityRe = /&(?:[a-zA-Z0-9]+|#[xX][\da-fA-F]+|#\d+);/g;
exports.decodeXML = getStrictDecoder(xml_json_1.default);
exports.decodeHTMLStrict = getStrictDecoder(entities_json_1.default);
function getStrictDecoder(map) {
    var replace = getReplacer(map);
    return function(str) {
        return String(str).replace(strictEntityRe, replace);
    };
}
var sorter = function(a, b) {
    return a < b ? 1 : -1;
};
exports.decodeHTML = function() {
    var legacy = Object.keys(legacy_json_1.default).sort(sorter);
    var keys = Object.keys(entities_json_1.default).sort(sorter);
    for(var i = 0, j = 0; i < keys.length; i++){
        if (legacy[j] === keys[i]) {
            keys[i] += ";?";
            j++;
        } else {
            keys[i] += ";";
        }
    }
    var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g");
    var replace = getReplacer(entities_json_1.default);
    function replacer(str) {
        if (str.substr(-1) !== ";") str += ";";
        return replace(str);
    }
    // TODO consider creating a merged map
    return function(str) {
        return String(str).replace(re, replacer);
    };
}();
function getReplacer(map) {
    return function replace(str) {
        if (str.charAt(1) === "#") {
            var secondChar = str.charAt(2);
            if (secondChar === "X" || secondChar === "x") {
                return decode_codepoint_1.default(parseInt(str.substr(3), 16));
            }
            return decode_codepoint_1.default(parseInt(str.substr(2), 10));
        }
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return map[str.slice(1, -1)] || str;
    };
}
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.decodeXMLStrict = exports.decodeHTML5Strict = exports.decodeHTML4Strict = exports.decodeHTML5 = exports.decodeHTML4 = exports.decodeHTMLStrict = exports.decodeHTML = exports.decodeXML = exports.encodeHTML5 = exports.encodeHTML4 = exports.escapeUTF8 = exports.escape = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.encodeXML = exports.encode = exports.decodeStrict = exports.decode = void 0;
var decode_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/decode.js [app-route] (ecmascript)");
var encode_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/encode.js [app-route] (ecmascript)");
/**
 * Decodes a string with entities.
 *
 * @param data String to decode.
 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
 * @deprecated Use `decodeXML` or `decodeHTML` directly.
 */ function decode(data, level) {
    return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTML)(data);
}
exports.decode = decode;
/**
 * Decodes a string with entities. Does not allow missing trailing semicolons for entities.
 *
 * @param data String to decode.
 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
 * @deprecated Use `decodeHTMLStrict` or `decodeXML` directly.
 */ function decodeStrict(data, level) {
    return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTMLStrict)(data);
}
exports.decodeStrict = decodeStrict;
/**
 * Encodes a string with entities.
 *
 * @param data String to encode.
 * @param level Optional level to encode at. 0 = XML, 1 = HTML. Default is 0.
 * @deprecated Use `encodeHTML`, `encodeXML` or `encodeNonAsciiHTML` directly.
 */ function encode(data, level) {
    return (!level || level <= 0 ? encode_1.encodeXML : encode_1.encodeHTML)(data);
}
exports.encode = encode;
var encode_2 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/encode.js [app-route] (ecmascript)");
Object.defineProperty(exports, "encodeXML", {
    enumerable: true,
    get: function() {
        return encode_2.encodeXML;
    }
});
Object.defineProperty(exports, "encodeHTML", {
    enumerable: true,
    get: function() {
        return encode_2.encodeHTML;
    }
});
Object.defineProperty(exports, "encodeNonAsciiHTML", {
    enumerable: true,
    get: function() {
        return encode_2.encodeNonAsciiHTML;
    }
});
Object.defineProperty(exports, "escape", {
    enumerable: true,
    get: function() {
        return encode_2.escape;
    }
});
Object.defineProperty(exports, "escapeUTF8", {
    enumerable: true,
    get: function() {
        return encode_2.escapeUTF8;
    }
});
// Legacy aliases (deprecated)
Object.defineProperty(exports, "encodeHTML4", {
    enumerable: true,
    get: function() {
        return encode_2.encodeHTML;
    }
});
Object.defineProperty(exports, "encodeHTML5", {
    enumerable: true,
    get: function() {
        return encode_2.encodeHTML;
    }
});
var decode_2 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/decode.js [app-route] (ecmascript)");
Object.defineProperty(exports, "decodeXML", {
    enumerable: true,
    get: function() {
        return decode_2.decodeXML;
    }
});
Object.defineProperty(exports, "decodeHTML", {
    enumerable: true,
    get: function() {
        return decode_2.decodeHTML;
    }
});
Object.defineProperty(exports, "decodeHTMLStrict", {
    enumerable: true,
    get: function() {
        return decode_2.decodeHTMLStrict;
    }
});
// Legacy aliases (deprecated)
Object.defineProperty(exports, "decodeHTML4", {
    enumerable: true,
    get: function() {
        return decode_2.decodeHTML;
    }
});
Object.defineProperty(exports, "decodeHTML5", {
    enumerable: true,
    get: function() {
        return decode_2.decodeHTML;
    }
});
Object.defineProperty(exports, "decodeHTML4Strict", {
    enumerable: true,
    get: function() {
        return decode_2.decodeHTMLStrict;
    }
});
Object.defineProperty(exports, "decodeHTML5Strict", {
    enumerable: true,
    get: function() {
        return decode_2.decodeHTMLStrict;
    }
});
Object.defineProperty(exports, "decodeXMLStrict", {
    enumerable: true,
    get: function() {
        return decode_2.decodeXML;
    }
});
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/lib/Tokenizer.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __importDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
var decode_codepoint_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/decode_codepoint.js [app-route] (ecmascript)"));
var entities_json_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/maps/entities.json (json)"));
var legacy_json_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/maps/legacy.json (json)"));
var xml_json_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/maps/xml.json (json)"));
function whitespace(c) {
    return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
}
function isASCIIAlpha(c) {
    return c >= "a" && c <= "z" || c >= "A" && c <= "Z";
}
function ifElseState(upper, SUCCESS, FAILURE) {
    var lower = upper.toLowerCase();
    if (upper === lower) {
        return function(t, c) {
            if (c === lower) {
                t._state = SUCCESS;
            } else {
                t._state = FAILURE;
                t._index--;
            }
        };
    }
    return function(t, c) {
        if (c === lower || c === upper) {
            t._state = SUCCESS;
        } else {
            t._state = FAILURE;
            t._index--;
        }
    };
}
function consumeSpecialNameChar(upper, NEXT_STATE) {
    var lower = upper.toLowerCase();
    return function(t, c) {
        if (c === lower || c === upper) {
            t._state = NEXT_STATE;
        } else {
            t._state = 3 /* InTagName */ ;
            t._index--; // Consume the token again
        }
    };
}
var stateBeforeCdata1 = ifElseState("C", 24 /* BeforeCdata2 */ , 16 /* InDeclaration */ );
var stateBeforeCdata2 = ifElseState("D", 25 /* BeforeCdata3 */ , 16 /* InDeclaration */ );
var stateBeforeCdata3 = ifElseState("A", 26 /* BeforeCdata4 */ , 16 /* InDeclaration */ );
var stateBeforeCdata4 = ifElseState("T", 27 /* BeforeCdata5 */ , 16 /* InDeclaration */ );
var stateBeforeCdata5 = ifElseState("A", 28 /* BeforeCdata6 */ , 16 /* InDeclaration */ );
var stateBeforeScript1 = consumeSpecialNameChar("R", 35 /* BeforeScript2 */ );
var stateBeforeScript2 = consumeSpecialNameChar("I", 36 /* BeforeScript3 */ );
var stateBeforeScript3 = consumeSpecialNameChar("P", 37 /* BeforeScript4 */ );
var stateBeforeScript4 = consumeSpecialNameChar("T", 38 /* BeforeScript5 */ );
var stateAfterScript1 = ifElseState("R", 40 /* AfterScript2 */ , 1 /* Text */ );
var stateAfterScript2 = ifElseState("I", 41 /* AfterScript3 */ , 1 /* Text */ );
var stateAfterScript3 = ifElseState("P", 42 /* AfterScript4 */ , 1 /* Text */ );
var stateAfterScript4 = ifElseState("T", 43 /* AfterScript5 */ , 1 /* Text */ );
var stateBeforeStyle1 = consumeSpecialNameChar("Y", 45 /* BeforeStyle2 */ );
var stateBeforeStyle2 = consumeSpecialNameChar("L", 46 /* BeforeStyle3 */ );
var stateBeforeStyle3 = consumeSpecialNameChar("E", 47 /* BeforeStyle4 */ );
var stateAfterStyle1 = ifElseState("Y", 49 /* AfterStyle2 */ , 1 /* Text */ );
var stateAfterStyle2 = ifElseState("L", 50 /* AfterStyle3 */ , 1 /* Text */ );
var stateAfterStyle3 = ifElseState("E", 51 /* AfterStyle4 */ , 1 /* Text */ );
var stateBeforeSpecialT = consumeSpecialNameChar("I", 54 /* BeforeTitle1 */ );
var stateBeforeTitle1 = consumeSpecialNameChar("T", 55 /* BeforeTitle2 */ );
var stateBeforeTitle2 = consumeSpecialNameChar("L", 56 /* BeforeTitle3 */ );
var stateBeforeTitle3 = consumeSpecialNameChar("E", 57 /* BeforeTitle4 */ );
var stateAfterSpecialTEnd = ifElseState("I", 58 /* AfterTitle1 */ , 1 /* Text */ );
var stateAfterTitle1 = ifElseState("T", 59 /* AfterTitle2 */ , 1 /* Text */ );
var stateAfterTitle2 = ifElseState("L", 60 /* AfterTitle3 */ , 1 /* Text */ );
var stateAfterTitle3 = ifElseState("E", 61 /* AfterTitle4 */ , 1 /* Text */ );
var stateBeforeEntity = ifElseState("#", 63 /* BeforeNumericEntity */ , 64 /* InNamedEntity */ );
var stateBeforeNumericEntity = ifElseState("X", 66 /* InHexEntity */ , 65 /* InNumericEntity */ );
var Tokenizer = function() {
    function Tokenizer(options, cbs) {
        var _a;
        /** The current state the tokenizer is in. */ this._state = 1 /* Text */ ;
        /** The read buffer. */ this.buffer = "";
        /** The beginning of the section that is currently being read. */ this.sectionStart = 0;
        /** The index within the buffer that we are currently looking at. */ this._index = 0;
        /**
         * Data that has already been processed will be removed from the buffer occasionally.
         * `_bufferOffset` keeps track of how many characters have been removed, to make sure position information is accurate.
         */ this.bufferOffset = 0;
        /** Some behavior, eg. when decoding entities, is done while we are in another state. This keeps track of the other state type. */ this.baseState = 1 /* Text */ ;
        /** For special parsing behavior inside of script and style tags. */ this.special = 1 /* None */ ;
        /** Indicates whether the tokenizer has been paused. */ this.running = true;
        /** Indicates whether the tokenizer has finished running / `.end` has been called. */ this.ended = false;
        this.cbs = cbs;
        this.xmlMode = !!(options === null || options === void 0 ? void 0 : options.xmlMode);
        this.decodeEntities = (_a = options === null || options === void 0 ? void 0 : options.decodeEntities) !== null && _a !== void 0 ? _a : true;
    }
    Tokenizer.prototype.reset = function() {
        this._state = 1 /* Text */ ;
        this.buffer = "";
        this.sectionStart = 0;
        this._index = 0;
        this.bufferOffset = 0;
        this.baseState = 1 /* Text */ ;
        this.special = 1 /* None */ ;
        this.running = true;
        this.ended = false;
    };
    Tokenizer.prototype.write = function(chunk) {
        if (this.ended) this.cbs.onerror(Error(".write() after done!"));
        this.buffer += chunk;
        this.parse();
    };
    Tokenizer.prototype.end = function(chunk) {
        if (this.ended) this.cbs.onerror(Error(".end() after done!"));
        if (chunk) this.write(chunk);
        this.ended = true;
        if (this.running) this.finish();
    };
    Tokenizer.prototype.pause = function() {
        this.running = false;
    };
    Tokenizer.prototype.resume = function() {
        this.running = true;
        if (this._index < this.buffer.length) {
            this.parse();
        }
        if (this.ended) {
            this.finish();
        }
    };
    /**
     * The current index within all of the written data.
     */ Tokenizer.prototype.getAbsoluteIndex = function() {
        return this.bufferOffset + this._index;
    };
    Tokenizer.prototype.stateText = function(c) {
        if (c === "<") {
            if (this._index > this.sectionStart) {
                this.cbs.ontext(this.getSection());
            }
            this._state = 2 /* BeforeTagName */ ;
            this.sectionStart = this._index;
        } else if (this.decodeEntities && c === "&" && (this.special === 1 /* None */  || this.special === 4 /* Title */ )) {
            if (this._index > this.sectionStart) {
                this.cbs.ontext(this.getSection());
            }
            this.baseState = 1 /* Text */ ;
            this._state = 62 /* BeforeEntity */ ;
            this.sectionStart = this._index;
        }
    };
    /**
     * HTML only allows ASCII alpha characters (a-z and A-Z) at the beginning of a tag name.
     *
     * XML allows a lot more characters here (@see https://www.w3.org/TR/REC-xml/#NT-NameStartChar).
     * We allow anything that wouldn't end the tag.
     */ Tokenizer.prototype.isTagStartChar = function(c) {
        return isASCIIAlpha(c) || this.xmlMode && !whitespace(c) && c !== "/" && c !== ">";
    };
    Tokenizer.prototype.stateBeforeTagName = function(c) {
        if (c === "/") {
            this._state = 5 /* BeforeClosingTagName */ ;
        } else if (c === "<") {
            this.cbs.ontext(this.getSection());
            this.sectionStart = this._index;
        } else if (c === ">" || this.special !== 1 /* None */  || whitespace(c)) {
            this._state = 1 /* Text */ ;
        } else if (c === "!") {
            this._state = 15 /* BeforeDeclaration */ ;
            this.sectionStart = this._index + 1;
        } else if (c === "?") {
            this._state = 17 /* InProcessingInstruction */ ;
            this.sectionStart = this._index + 1;
        } else if (!this.isTagStartChar(c)) {
            this._state = 1 /* Text */ ;
        } else {
            this._state = !this.xmlMode && (c === "s" || c === "S") ? 32 /* BeforeSpecialS */  : !this.xmlMode && (c === "t" || c === "T") ? 52 /* BeforeSpecialT */  : 3 /* InTagName */ ;
            this.sectionStart = this._index;
        }
    };
    Tokenizer.prototype.stateInTagName = function(c) {
        if (c === "/" || c === ">" || whitespace(c)) {
            this.emitToken("onopentagname");
            this._state = 8 /* BeforeAttributeName */ ;
            this._index--;
        }
    };
    Tokenizer.prototype.stateBeforeClosingTagName = function(c) {
        if (whitespace(c)) {
        // Ignore
        } else if (c === ">") {
            this._state = 1 /* Text */ ;
        } else if (this.special !== 1 /* None */ ) {
            if (this.special !== 4 /* Title */  && (c === "s" || c === "S")) {
                this._state = 33 /* BeforeSpecialSEnd */ ;
            } else if (this.special === 4 /* Title */  && (c === "t" || c === "T")) {
                this._state = 53 /* BeforeSpecialTEnd */ ;
            } else {
                this._state = 1 /* Text */ ;
                this._index--;
            }
        } else if (!this.isTagStartChar(c)) {
            this._state = 20 /* InSpecialComment */ ;
            this.sectionStart = this._index;
        } else {
            this._state = 6 /* InClosingTagName */ ;
            this.sectionStart = this._index;
        }
    };
    Tokenizer.prototype.stateInClosingTagName = function(c) {
        if (c === ">" || whitespace(c)) {
            this.emitToken("onclosetag");
            this._state = 7 /* AfterClosingTagName */ ;
            this._index--;
        }
    };
    Tokenizer.prototype.stateAfterClosingTagName = function(c) {
        // Skip everything until ">"
        if (c === ">") {
            this._state = 1 /* Text */ ;
            this.sectionStart = this._index + 1;
        }
    };
    Tokenizer.prototype.stateBeforeAttributeName = function(c) {
        if (c === ">") {
            this.cbs.onopentagend();
            this._state = 1 /* Text */ ;
            this.sectionStart = this._index + 1;
        } else if (c === "/") {
            this._state = 4 /* InSelfClosingTag */ ;
        } else if (!whitespace(c)) {
            this._state = 9 /* InAttributeName */ ;
            this.sectionStart = this._index;
        }
    };
    Tokenizer.prototype.stateInSelfClosingTag = function(c) {
        if (c === ">") {
            this.cbs.onselfclosingtag();
            this._state = 1 /* Text */ ;
            this.sectionStart = this._index + 1;
            this.special = 1 /* None */ ; // Reset special state, in case of self-closing special tags
        } else if (!whitespace(c)) {
            this._state = 8 /* BeforeAttributeName */ ;
            this._index--;
        }
    };
    Tokenizer.prototype.stateInAttributeName = function(c) {
        if (c === "=" || c === "/" || c === ">" || whitespace(c)) {
            this.cbs.onattribname(this.getSection());
            this.sectionStart = -1;
            this._state = 10 /* AfterAttributeName */ ;
            this._index--;
        }
    };
    Tokenizer.prototype.stateAfterAttributeName = function(c) {
        if (c === "=") {
            this._state = 11 /* BeforeAttributeValue */ ;
        } else if (c === "/" || c === ">") {
            this.cbs.onattribend(undefined);
            this._state = 8 /* BeforeAttributeName */ ;
            this._index--;
        } else if (!whitespace(c)) {
            this.cbs.onattribend(undefined);
            this._state = 9 /* InAttributeName */ ;
            this.sectionStart = this._index;
        }
    };
    Tokenizer.prototype.stateBeforeAttributeValue = function(c) {
        if (c === '"') {
            this._state = 12 /* InAttributeValueDq */ ;
            this.sectionStart = this._index + 1;
        } else if (c === "'") {
            this._state = 13 /* InAttributeValueSq */ ;
            this.sectionStart = this._index + 1;
        } else if (!whitespace(c)) {
            this._state = 14 /* InAttributeValueNq */ ;
            this.sectionStart = this._index;
            this._index--; // Reconsume token
        }
    };
    Tokenizer.prototype.handleInAttributeValue = function(c, quote) {
        if (c === quote) {
            this.emitToken("onattribdata");
            this.cbs.onattribend(quote);
            this._state = 8 /* BeforeAttributeName */ ;
        } else if (this.decodeEntities && c === "&") {
            this.emitToken("onattribdata");
            this.baseState = this._state;
            this._state = 62 /* BeforeEntity */ ;
            this.sectionStart = this._index;
        }
    };
    Tokenizer.prototype.stateInAttributeValueDoubleQuotes = function(c) {
        this.handleInAttributeValue(c, '"');
    };
    Tokenizer.prototype.stateInAttributeValueSingleQuotes = function(c) {
        this.handleInAttributeValue(c, "'");
    };
    Tokenizer.prototype.stateInAttributeValueNoQuotes = function(c) {
        if (whitespace(c) || c === ">") {
            this.emitToken("onattribdata");
            this.cbs.onattribend(null);
            this._state = 8 /* BeforeAttributeName */ ;
            this._index--;
        } else if (this.decodeEntities && c === "&") {
            this.emitToken("onattribdata");
            this.baseState = this._state;
            this._state = 62 /* BeforeEntity */ ;
            this.sectionStart = this._index;
        }
    };
    Tokenizer.prototype.stateBeforeDeclaration = function(c) {
        this._state = c === "[" ? 23 /* BeforeCdata1 */  : c === "-" ? 18 /* BeforeComment */  : 16 /* InDeclaration */ ;
    };
    Tokenizer.prototype.stateInDeclaration = function(c) {
        if (c === ">") {
            this.cbs.ondeclaration(this.getSection());
            this._state = 1 /* Text */ ;
            this.sectionStart = this._index + 1;
        }
    };
    Tokenizer.prototype.stateInProcessingInstruction = function(c) {
        if (c === ">") {
            this.cbs.onprocessinginstruction(this.getSection());
            this._state = 1 /* Text */ ;
            this.sectionStart = this._index + 1;
        }
    };
    Tokenizer.prototype.stateBeforeComment = function(c) {
        if (c === "-") {
            this._state = 19 /* InComment */ ;
            this.sectionStart = this._index + 1;
        } else {
            this._state = 16 /* InDeclaration */ ;
        }
    };
    Tokenizer.prototype.stateInComment = function(c) {
        if (c === "-") this._state = 21 /* AfterComment1 */ ;
    };
    Tokenizer.prototype.stateInSpecialComment = function(c) {
        if (c === ">") {
            this.cbs.oncomment(this.buffer.substring(this.sectionStart, this._index));
            this._state = 1 /* Text */ ;
            this.sectionStart = this._index + 1;
        }
    };
    Tokenizer.prototype.stateAfterComment1 = function(c) {
        if (c === "-") {
            this._state = 22 /* AfterComment2 */ ;
        } else {
            this._state = 19 /* InComment */ ;
        }
    };
    Tokenizer.prototype.stateAfterComment2 = function(c) {
        if (c === ">") {
            // Remove 2 trailing chars
            this.cbs.oncomment(this.buffer.substring(this.sectionStart, this._index - 2));
            this._state = 1 /* Text */ ;
            this.sectionStart = this._index + 1;
        } else if (c !== "-") {
            this._state = 19 /* InComment */ ;
        }
    // Else: stay in AFTER_COMMENT_2 (`--->`)
    };
    Tokenizer.prototype.stateBeforeCdata6 = function(c) {
        if (c === "[") {
            this._state = 29 /* InCdata */ ;
            this.sectionStart = this._index + 1;
        } else {
            this._state = 16 /* InDeclaration */ ;
            this._index--;
        }
    };
    Tokenizer.prototype.stateInCdata = function(c) {
        if (c === "]") this._state = 30 /* AfterCdata1 */ ;
    };
    Tokenizer.prototype.stateAfterCdata1 = function(c) {
        if (c === "]") this._state = 31 /* AfterCdata2 */ ;
        else this._state = 29 /* InCdata */ ;
    };
    Tokenizer.prototype.stateAfterCdata2 = function(c) {
        if (c === ">") {
            // Remove 2 trailing chars
            this.cbs.oncdata(this.buffer.substring(this.sectionStart, this._index - 2));
            this._state = 1 /* Text */ ;
            this.sectionStart = this._index + 1;
        } else if (c !== "]") {
            this._state = 29 /* InCdata */ ;
        }
    // Else: stay in AFTER_CDATA_2 (`]]]>`)
    };
    Tokenizer.prototype.stateBeforeSpecialS = function(c) {
        if (c === "c" || c === "C") {
            this._state = 34 /* BeforeScript1 */ ;
        } else if (c === "t" || c === "T") {
            this._state = 44 /* BeforeStyle1 */ ;
        } else {
            this._state = 3 /* InTagName */ ;
            this._index--; // Consume the token again
        }
    };
    Tokenizer.prototype.stateBeforeSpecialSEnd = function(c) {
        if (this.special === 2 /* Script */  && (c === "c" || c === "C")) {
            this._state = 39 /* AfterScript1 */ ;
        } else if (this.special === 3 /* Style */  && (c === "t" || c === "T")) {
            this._state = 48 /* AfterStyle1 */ ;
        } else this._state = 1 /* Text */ ;
    };
    Tokenizer.prototype.stateBeforeSpecialLast = function(c, special) {
        if (c === "/" || c === ">" || whitespace(c)) {
            this.special = special;
        }
        this._state = 3 /* InTagName */ ;
        this._index--; // Consume the token again
    };
    Tokenizer.prototype.stateAfterSpecialLast = function(c, sectionStartOffset) {
        if (c === ">" || whitespace(c)) {
            this.special = 1 /* None */ ;
            this._state = 6 /* InClosingTagName */ ;
            this.sectionStart = this._index - sectionStartOffset;
            this._index--; // Reconsume the token
        } else this._state = 1 /* Text */ ;
    };
    // For entities terminated with a semicolon
    Tokenizer.prototype.parseFixedEntity = function(map) {
        if (map === void 0) {
            map = this.xmlMode ? xml_json_1.default : entities_json_1.default;
        }
        // Offset = 1
        if (this.sectionStart + 1 < this._index) {
            var entity = this.buffer.substring(this.sectionStart + 1, this._index);
            if (Object.prototype.hasOwnProperty.call(map, entity)) {
                this.emitPartial(map[entity]);
                this.sectionStart = this._index + 1;
            }
        }
    };
    // Parses legacy entities (without trailing semicolon)
    Tokenizer.prototype.parseLegacyEntity = function() {
        var start = this.sectionStart + 1;
        // The max length of legacy entities is 6
        var limit = Math.min(this._index - start, 6);
        while(limit >= 2){
            // The min length of legacy entities is 2
            var entity = this.buffer.substr(start, limit);
            if (Object.prototype.hasOwnProperty.call(legacy_json_1.default, entity)) {
                this.emitPartial(legacy_json_1.default[entity]);
                this.sectionStart += limit + 1;
                return;
            }
            limit--;
        }
    };
    Tokenizer.prototype.stateInNamedEntity = function(c) {
        if (c === ";") {
            this.parseFixedEntity();
            // Retry as legacy entity if entity wasn't parsed
            if (this.baseState === 1 /* Text */  && this.sectionStart + 1 < this._index && !this.xmlMode) {
                this.parseLegacyEntity();
            }
            this._state = this.baseState;
        } else if ((c < "0" || c > "9") && !isASCIIAlpha(c)) {
            if (this.xmlMode || this.sectionStart + 1 === this._index) {
            // Ignore
            } else if (this.baseState !== 1 /* Text */ ) {
                if (c !== "=") {
                    // Parse as legacy entity, without allowing additional characters.
                    this.parseFixedEntity(legacy_json_1.default);
                }
            } else {
                this.parseLegacyEntity();
            }
            this._state = this.baseState;
            this._index--;
        }
    };
    Tokenizer.prototype.decodeNumericEntity = function(offset, base, strict) {
        var sectionStart = this.sectionStart + offset;
        if (sectionStart !== this._index) {
            // Parse entity
            var entity = this.buffer.substring(sectionStart, this._index);
            var parsed = parseInt(entity, base);
            this.emitPartial(decode_codepoint_1.default(parsed));
            this.sectionStart = strict ? this._index + 1 : this._index;
        }
        this._state = this.baseState;
    };
    Tokenizer.prototype.stateInNumericEntity = function(c) {
        if (c === ";") {
            this.decodeNumericEntity(2, 10, true);
        } else if (c < "0" || c > "9") {
            if (!this.xmlMode) {
                this.decodeNumericEntity(2, 10, false);
            } else {
                this._state = this.baseState;
            }
            this._index--;
        }
    };
    Tokenizer.prototype.stateInHexEntity = function(c) {
        if (c === ";") {
            this.decodeNumericEntity(3, 16, true);
        } else if ((c < "a" || c > "f") && (c < "A" || c > "F") && (c < "0" || c > "9")) {
            if (!this.xmlMode) {
                this.decodeNumericEntity(3, 16, false);
            } else {
                this._state = this.baseState;
            }
            this._index--;
        }
    };
    Tokenizer.prototype.cleanup = function() {
        if (this.sectionStart < 0) {
            this.buffer = "";
            this.bufferOffset += this._index;
            this._index = 0;
        } else if (this.running) {
            if (this._state === 1 /* Text */ ) {
                if (this.sectionStart !== this._index) {
                    this.cbs.ontext(this.buffer.substr(this.sectionStart));
                }
                this.buffer = "";
                this.bufferOffset += this._index;
                this._index = 0;
            } else if (this.sectionStart === this._index) {
                // The section just started
                this.buffer = "";
                this.bufferOffset += this._index;
                this._index = 0;
            } else {
                // Remove everything unnecessary
                this.buffer = this.buffer.substr(this.sectionStart);
                this._index -= this.sectionStart;
                this.bufferOffset += this.sectionStart;
            }
            this.sectionStart = 0;
        }
    };
    /**
     * Iterates through the buffer, calling the function corresponding to the current state.
     *
     * States that are more likely to be hit are higher up, as a performance improvement.
     */ Tokenizer.prototype.parse = function() {
        while(this._index < this.buffer.length && this.running){
            var c = this.buffer.charAt(this._index);
            if (this._state === 1 /* Text */ ) {
                this.stateText(c);
            } else if (this._state === 12 /* InAttributeValueDq */ ) {
                this.stateInAttributeValueDoubleQuotes(c);
            } else if (this._state === 9 /* InAttributeName */ ) {
                this.stateInAttributeName(c);
            } else if (this._state === 19 /* InComment */ ) {
                this.stateInComment(c);
            } else if (this._state === 20 /* InSpecialComment */ ) {
                this.stateInSpecialComment(c);
            } else if (this._state === 8 /* BeforeAttributeName */ ) {
                this.stateBeforeAttributeName(c);
            } else if (this._state === 3 /* InTagName */ ) {
                this.stateInTagName(c);
            } else if (this._state === 6 /* InClosingTagName */ ) {
                this.stateInClosingTagName(c);
            } else if (this._state === 2 /* BeforeTagName */ ) {
                this.stateBeforeTagName(c);
            } else if (this._state === 10 /* AfterAttributeName */ ) {
                this.stateAfterAttributeName(c);
            } else if (this._state === 13 /* InAttributeValueSq */ ) {
                this.stateInAttributeValueSingleQuotes(c);
            } else if (this._state === 11 /* BeforeAttributeValue */ ) {
                this.stateBeforeAttributeValue(c);
            } else if (this._state === 5 /* BeforeClosingTagName */ ) {
                this.stateBeforeClosingTagName(c);
            } else if (this._state === 7 /* AfterClosingTagName */ ) {
                this.stateAfterClosingTagName(c);
            } else if (this._state === 32 /* BeforeSpecialS */ ) {
                this.stateBeforeSpecialS(c);
            } else if (this._state === 21 /* AfterComment1 */ ) {
                this.stateAfterComment1(c);
            } else if (this._state === 14 /* InAttributeValueNq */ ) {
                this.stateInAttributeValueNoQuotes(c);
            } else if (this._state === 4 /* InSelfClosingTag */ ) {
                this.stateInSelfClosingTag(c);
            } else if (this._state === 16 /* InDeclaration */ ) {
                this.stateInDeclaration(c);
            } else if (this._state === 15 /* BeforeDeclaration */ ) {
                this.stateBeforeDeclaration(c);
            } else if (this._state === 22 /* AfterComment2 */ ) {
                this.stateAfterComment2(c);
            } else if (this._state === 18 /* BeforeComment */ ) {
                this.stateBeforeComment(c);
            } else if (this._state === 33 /* BeforeSpecialSEnd */ ) {
                this.stateBeforeSpecialSEnd(c);
            } else if (this._state === 53 /* BeforeSpecialTEnd */ ) {
                stateAfterSpecialTEnd(this, c);
            } else if (this._state === 39 /* AfterScript1 */ ) {
                stateAfterScript1(this, c);
            } else if (this._state === 40 /* AfterScript2 */ ) {
                stateAfterScript2(this, c);
            } else if (this._state === 41 /* AfterScript3 */ ) {
                stateAfterScript3(this, c);
            } else if (this._state === 34 /* BeforeScript1 */ ) {
                stateBeforeScript1(this, c);
            } else if (this._state === 35 /* BeforeScript2 */ ) {
                stateBeforeScript2(this, c);
            } else if (this._state === 36 /* BeforeScript3 */ ) {
                stateBeforeScript3(this, c);
            } else if (this._state === 37 /* BeforeScript4 */ ) {
                stateBeforeScript4(this, c);
            } else if (this._state === 38 /* BeforeScript5 */ ) {
                this.stateBeforeSpecialLast(c, 2 /* Script */ );
            } else if (this._state === 42 /* AfterScript4 */ ) {
                stateAfterScript4(this, c);
            } else if (this._state === 43 /* AfterScript5 */ ) {
                this.stateAfterSpecialLast(c, 6);
            } else if (this._state === 44 /* BeforeStyle1 */ ) {
                stateBeforeStyle1(this, c);
            } else if (this._state === 29 /* InCdata */ ) {
                this.stateInCdata(c);
            } else if (this._state === 45 /* BeforeStyle2 */ ) {
                stateBeforeStyle2(this, c);
            } else if (this._state === 46 /* BeforeStyle3 */ ) {
                stateBeforeStyle3(this, c);
            } else if (this._state === 47 /* BeforeStyle4 */ ) {
                this.stateBeforeSpecialLast(c, 3 /* Style */ );
            } else if (this._state === 48 /* AfterStyle1 */ ) {
                stateAfterStyle1(this, c);
            } else if (this._state === 49 /* AfterStyle2 */ ) {
                stateAfterStyle2(this, c);
            } else if (this._state === 50 /* AfterStyle3 */ ) {
                stateAfterStyle3(this, c);
            } else if (this._state === 51 /* AfterStyle4 */ ) {
                this.stateAfterSpecialLast(c, 5);
            } else if (this._state === 52 /* BeforeSpecialT */ ) {
                stateBeforeSpecialT(this, c);
            } else if (this._state === 54 /* BeforeTitle1 */ ) {
                stateBeforeTitle1(this, c);
            } else if (this._state === 55 /* BeforeTitle2 */ ) {
                stateBeforeTitle2(this, c);
            } else if (this._state === 56 /* BeforeTitle3 */ ) {
                stateBeforeTitle3(this, c);
            } else if (this._state === 57 /* BeforeTitle4 */ ) {
                this.stateBeforeSpecialLast(c, 4 /* Title */ );
            } else if (this._state === 58 /* AfterTitle1 */ ) {
                stateAfterTitle1(this, c);
            } else if (this._state === 59 /* AfterTitle2 */ ) {
                stateAfterTitle2(this, c);
            } else if (this._state === 60 /* AfterTitle3 */ ) {
                stateAfterTitle3(this, c);
            } else if (this._state === 61 /* AfterTitle4 */ ) {
                this.stateAfterSpecialLast(c, 5);
            } else if (this._state === 17 /* InProcessingInstruction */ ) {
                this.stateInProcessingInstruction(c);
            } else if (this._state === 64 /* InNamedEntity */ ) {
                this.stateInNamedEntity(c);
            } else if (this._state === 23 /* BeforeCdata1 */ ) {
                stateBeforeCdata1(this, c);
            } else if (this._state === 62 /* BeforeEntity */ ) {
                stateBeforeEntity(this, c);
            } else if (this._state === 24 /* BeforeCdata2 */ ) {
                stateBeforeCdata2(this, c);
            } else if (this._state === 25 /* BeforeCdata3 */ ) {
                stateBeforeCdata3(this, c);
            } else if (this._state === 30 /* AfterCdata1 */ ) {
                this.stateAfterCdata1(c);
            } else if (this._state === 31 /* AfterCdata2 */ ) {
                this.stateAfterCdata2(c);
            } else if (this._state === 26 /* BeforeCdata4 */ ) {
                stateBeforeCdata4(this, c);
            } else if (this._state === 27 /* BeforeCdata5 */ ) {
                stateBeforeCdata5(this, c);
            } else if (this._state === 28 /* BeforeCdata6 */ ) {
                this.stateBeforeCdata6(c);
            } else if (this._state === 66 /* InHexEntity */ ) {
                this.stateInHexEntity(c);
            } else if (this._state === 65 /* InNumericEntity */ ) {
                this.stateInNumericEntity(c);
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            } else if (this._state === 63 /* BeforeNumericEntity */ ) {
                stateBeforeNumericEntity(this, c);
            } else {
                this.cbs.onerror(Error("unknown _state"), this._state);
            }
            this._index++;
        }
        this.cleanup();
    };
    Tokenizer.prototype.finish = function() {
        // If there is remaining data, emit it in a reasonable way
        if (this.sectionStart < this._index) {
            this.handleTrailingData();
        }
        this.cbs.onend();
    };
    Tokenizer.prototype.handleTrailingData = function() {
        var data = this.buffer.substr(this.sectionStart);
        if (this._state === 29 /* InCdata */  || this._state === 30 /* AfterCdata1 */  || this._state === 31 /* AfterCdata2 */ ) {
            this.cbs.oncdata(data);
        } else if (this._state === 19 /* InComment */  || this._state === 21 /* AfterComment1 */  || this._state === 22 /* AfterComment2 */ ) {
            this.cbs.oncomment(data);
        } else if (this._state === 64 /* InNamedEntity */  && !this.xmlMode) {
            this.parseLegacyEntity();
            if (this.sectionStart < this._index) {
                this._state = this.baseState;
                this.handleTrailingData();
            }
        } else if (this._state === 65 /* InNumericEntity */  && !this.xmlMode) {
            this.decodeNumericEntity(2, 10, false);
            if (this.sectionStart < this._index) {
                this._state = this.baseState;
                this.handleTrailingData();
            }
        } else if (this._state === 66 /* InHexEntity */  && !this.xmlMode) {
            this.decodeNumericEntity(3, 16, false);
            if (this.sectionStart < this._index) {
                this._state = this.baseState;
                this.handleTrailingData();
            }
        } else if (this._state !== 3 /* InTagName */  && this._state !== 8 /* BeforeAttributeName */  && this._state !== 11 /* BeforeAttributeValue */  && this._state !== 10 /* AfterAttributeName */  && this._state !== 9 /* InAttributeName */  && this._state !== 13 /* InAttributeValueSq */  && this._state !== 12 /* InAttributeValueDq */  && this._state !== 14 /* InAttributeValueNq */  && this._state !== 6 /* InClosingTagName */ ) {
            this.cbs.ontext(data);
        }
    /*
         * Else, ignore remaining data
         * TODO add a way to remove current tag
         */ };
    Tokenizer.prototype.getSection = function() {
        return this.buffer.substring(this.sectionStart, this._index);
    };
    Tokenizer.prototype.emitToken = function(name) {
        this.cbs[name](this.getSection());
        this.sectionStart = -1;
    };
    Tokenizer.prototype.emitPartial = function(value) {
        if (this.baseState !== 1 /* Text */ ) {
            this.cbs.onattribdata(value); // TODO implement the new event
        } else {
            this.cbs.ontext(value);
        }
    };
    return Tokenizer;
}();
exports.default = Tokenizer;
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/lib/Parser.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __importDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Parser = void 0;
var Tokenizer_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/lib/Tokenizer.js [app-route] (ecmascript)"));
var formTags = new Set([
    "input",
    "option",
    "optgroup",
    "select",
    "button",
    "datalist",
    "textarea"
]);
var pTag = new Set([
    "p"
]);
var openImpliesClose = {
    tr: new Set([
        "tr",
        "th",
        "td"
    ]),
    th: new Set([
        "th"
    ]),
    td: new Set([
        "thead",
        "th",
        "td"
    ]),
    body: new Set([
        "head",
        "link",
        "script"
    ]),
    li: new Set([
        "li"
    ]),
    p: pTag,
    h1: pTag,
    h2: pTag,
    h3: pTag,
    h4: pTag,
    h5: pTag,
    h6: pTag,
    select: formTags,
    input: formTags,
    output: formTags,
    button: formTags,
    datalist: formTags,
    textarea: formTags,
    option: new Set([
        "option"
    ]),
    optgroup: new Set([
        "optgroup",
        "option"
    ]),
    dd: new Set([
        "dt",
        "dd"
    ]),
    dt: new Set([
        "dt",
        "dd"
    ]),
    address: pTag,
    article: pTag,
    aside: pTag,
    blockquote: pTag,
    details: pTag,
    div: pTag,
    dl: pTag,
    fieldset: pTag,
    figcaption: pTag,
    figure: pTag,
    footer: pTag,
    form: pTag,
    header: pTag,
    hr: pTag,
    main: pTag,
    nav: pTag,
    ol: pTag,
    pre: pTag,
    section: pTag,
    table: pTag,
    ul: pTag,
    rt: new Set([
        "rt",
        "rp"
    ]),
    rp: new Set([
        "rt",
        "rp"
    ]),
    tbody: new Set([
        "thead",
        "tbody"
    ]),
    tfoot: new Set([
        "thead",
        "tbody"
    ])
};
var voidElements = new Set([
    "area",
    "base",
    "basefont",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
]);
var foreignContextElements = new Set([
    "math",
    "svg"
]);
var htmlIntegrationElements = new Set([
    "mi",
    "mo",
    "mn",
    "ms",
    "mtext",
    "annotation-xml",
    "foreignObject",
    "desc",
    "title"
]);
var reNameEnd = /\s|\//;
var Parser = function() {
    function Parser(cbs, options) {
        if (options === void 0) {
            options = {};
        }
        var _a, _b, _c, _d, _e;
        /** The start index of the last event. */ this.startIndex = 0;
        /** The end index of the last event. */ this.endIndex = null;
        this.tagname = "";
        this.attribname = "";
        this.attribvalue = "";
        this.attribs = null;
        this.stack = [];
        this.foreignContext = [];
        this.options = options;
        this.cbs = cbs !== null && cbs !== void 0 ? cbs : {};
        this.lowerCaseTagNames = (_a = options.lowerCaseTags) !== null && _a !== void 0 ? _a : !options.xmlMode;
        this.lowerCaseAttributeNames = (_b = options.lowerCaseAttributeNames) !== null && _b !== void 0 ? _b : !options.xmlMode;
        this.tokenizer = new ((_c = options.Tokenizer) !== null && _c !== void 0 ? _c : Tokenizer_1.default)(this.options, this);
        (_e = (_d = this.cbs).onparserinit) === null || _e === void 0 ? void 0 : _e.call(_d, this);
    }
    Parser.prototype.updatePosition = function(initialOffset) {
        if (this.endIndex === null) {
            if (this.tokenizer.sectionStart <= initialOffset) {
                this.startIndex = 0;
            } else {
                this.startIndex = this.tokenizer.sectionStart - initialOffset;
            }
        } else {
            this.startIndex = this.endIndex + 1;
        }
        this.endIndex = this.tokenizer.getAbsoluteIndex();
    };
    // Tokenizer event handlers
    Parser.prototype.ontext = function(data) {
        var _a, _b;
        this.updatePosition(1);
        this.endIndex--;
        (_b = (_a = this.cbs).ontext) === null || _b === void 0 ? void 0 : _b.call(_a, data);
    };
    Parser.prototype.onopentagname = function(name) {
        var _a, _b;
        if (this.lowerCaseTagNames) {
            name = name.toLowerCase();
        }
        this.tagname = name;
        if (!this.options.xmlMode && Object.prototype.hasOwnProperty.call(openImpliesClose, name)) {
            var el = void 0;
            while(this.stack.length > 0 && openImpliesClose[name].has(el = this.stack[this.stack.length - 1])){
                this.onclosetag(el);
            }
        }
        if (this.options.xmlMode || !voidElements.has(name)) {
            this.stack.push(name);
            if (foreignContextElements.has(name)) {
                this.foreignContext.push(true);
            } else if (htmlIntegrationElements.has(name)) {
                this.foreignContext.push(false);
            }
        }
        (_b = (_a = this.cbs).onopentagname) === null || _b === void 0 ? void 0 : _b.call(_a, name);
        if (this.cbs.onopentag) this.attribs = {};
    };
    Parser.prototype.onopentagend = function() {
        var _a, _b;
        this.updatePosition(1);
        if (this.attribs) {
            (_b = (_a = this.cbs).onopentag) === null || _b === void 0 ? void 0 : _b.call(_a, this.tagname, this.attribs);
            this.attribs = null;
        }
        if (!this.options.xmlMode && this.cbs.onclosetag && voidElements.has(this.tagname)) {
            this.cbs.onclosetag(this.tagname);
        }
        this.tagname = "";
    };
    Parser.prototype.onclosetag = function(name) {
        this.updatePosition(1);
        if (this.lowerCaseTagNames) {
            name = name.toLowerCase();
        }
        if (foreignContextElements.has(name) || htmlIntegrationElements.has(name)) {
            this.foreignContext.pop();
        }
        if (this.stack.length && (this.options.xmlMode || !voidElements.has(name))) {
            var pos = this.stack.lastIndexOf(name);
            if (pos !== -1) {
                if (this.cbs.onclosetag) {
                    pos = this.stack.length - pos;
                    while(pos--){
                        // We know the stack has sufficient elements.
                        this.cbs.onclosetag(this.stack.pop());
                    }
                } else this.stack.length = pos;
            } else if (name === "p" && !this.options.xmlMode) {
                this.onopentagname(name);
                this.closeCurrentTag();
            }
        } else if (!this.options.xmlMode && (name === "br" || name === "p")) {
            this.onopentagname(name);
            this.closeCurrentTag();
        }
    };
    Parser.prototype.onselfclosingtag = function() {
        if (this.options.xmlMode || this.options.recognizeSelfClosing || this.foreignContext[this.foreignContext.length - 1]) {
            this.closeCurrentTag();
        } else {
            this.onopentagend();
        }
    };
    Parser.prototype.closeCurrentTag = function() {
        var _a, _b;
        var name = this.tagname;
        this.onopentagend();
        /*
         * Self-closing tags will be on the top of the stack
         * (cheaper check than in onclosetag)
         */ if (this.stack[this.stack.length - 1] === name) {
            (_b = (_a = this.cbs).onclosetag) === null || _b === void 0 ? void 0 : _b.call(_a, name);
            this.stack.pop();
        }
    };
    Parser.prototype.onattribname = function(name) {
        if (this.lowerCaseAttributeNames) {
            name = name.toLowerCase();
        }
        this.attribname = name;
    };
    Parser.prototype.onattribdata = function(value) {
        this.attribvalue += value;
    };
    Parser.prototype.onattribend = function(quote) {
        var _a, _b;
        (_b = (_a = this.cbs).onattribute) === null || _b === void 0 ? void 0 : _b.call(_a, this.attribname, this.attribvalue, quote);
        if (this.attribs && !Object.prototype.hasOwnProperty.call(this.attribs, this.attribname)) {
            this.attribs[this.attribname] = this.attribvalue;
        }
        this.attribname = "";
        this.attribvalue = "";
    };
    Parser.prototype.getInstructionName = function(value) {
        var idx = value.search(reNameEnd);
        var name = idx < 0 ? value : value.substr(0, idx);
        if (this.lowerCaseTagNames) {
            name = name.toLowerCase();
        }
        return name;
    };
    Parser.prototype.ondeclaration = function(value) {
        if (this.cbs.onprocessinginstruction) {
            var name_1 = this.getInstructionName(value);
            this.cbs.onprocessinginstruction("!" + name_1, "!" + value);
        }
    };
    Parser.prototype.onprocessinginstruction = function(value) {
        if (this.cbs.onprocessinginstruction) {
            var name_2 = this.getInstructionName(value);
            this.cbs.onprocessinginstruction("?" + name_2, "?" + value);
        }
    };
    Parser.prototype.oncomment = function(value) {
        var _a, _b, _c, _d;
        this.updatePosition(4);
        (_b = (_a = this.cbs).oncomment) === null || _b === void 0 ? void 0 : _b.call(_a, value);
        (_d = (_c = this.cbs).oncommentend) === null || _d === void 0 ? void 0 : _d.call(_c);
    };
    Parser.prototype.oncdata = function(value) {
        var _a, _b, _c, _d, _e, _f;
        this.updatePosition(1);
        if (this.options.xmlMode || this.options.recognizeCDATA) {
            (_b = (_a = this.cbs).oncdatastart) === null || _b === void 0 ? void 0 : _b.call(_a);
            (_d = (_c = this.cbs).ontext) === null || _d === void 0 ? void 0 : _d.call(_c, value);
            (_f = (_e = this.cbs).oncdataend) === null || _f === void 0 ? void 0 : _f.call(_e);
        } else {
            this.oncomment("[CDATA[" + value + "]]");
        }
    };
    Parser.prototype.onerror = function(err) {
        var _a, _b;
        (_b = (_a = this.cbs).onerror) === null || _b === void 0 ? void 0 : _b.call(_a, err);
    };
    Parser.prototype.onend = function() {
        var _a, _b;
        if (this.cbs.onclosetag) {
            for(var i = this.stack.length; i > 0; this.cbs.onclosetag(this.stack[--i]));
        }
        (_b = (_a = this.cbs).onend) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    /**
     * Resets the parser to a blank state, ready to parse a new HTML document
     */ Parser.prototype.reset = function() {
        var _a, _b, _c, _d;
        (_b = (_a = this.cbs).onreset) === null || _b === void 0 ? void 0 : _b.call(_a);
        this.tokenizer.reset();
        this.tagname = "";
        this.attribname = "";
        this.attribs = null;
        this.stack = [];
        (_d = (_c = this.cbs).onparserinit) === null || _d === void 0 ? void 0 : _d.call(_c, this);
    };
    /**
     * Resets the parser, then parses a complete document and
     * pushes it to the handler.
     *
     * @param data Document to parse.
     */ Parser.prototype.parseComplete = function(data) {
        this.reset();
        this.end(data);
    };
    /**
     * Parses a chunk of data and calls the corresponding callbacks.
     *
     * @param chunk Chunk to parse.
     */ Parser.prototype.write = function(chunk) {
        this.tokenizer.write(chunk);
    };
    /**
     * Parses the end of the buffer and clears the stack, calls onend.
     *
     * @param chunk Optional final chunk to parse.
     */ Parser.prototype.end = function(chunk) {
        this.tokenizer.end(chunk);
    };
    /**
     * Pauses parsing. The parser won't emit events until `resume` is called.
     */ Parser.prototype.pause = function() {
        this.tokenizer.pause();
    };
    /**
     * Resumes parsing after `pause` was called.
     */ Parser.prototype.resume = function() {
        this.tokenizer.resume();
    };
    /**
     * Alias of `write`, for backwards compatibility.
     *
     * @param chunk Chunk to parse.
     * @deprecated
     */ Parser.prototype.parseChunk = function(chunk) {
        this.write(chunk);
    };
    /**
     * Alias of `end`, for backwards compatibility.
     *
     * @param chunk Optional final chunk to parse.
     * @deprecated
     */ Parser.prototype.done = function(chunk) {
        this.end(chunk);
    };
    return Parser;
}();
exports.Parser = Parser;
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/lib/FeedHandler.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __extends = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__extends || function() {
    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || ({
            __proto__: []
        }) instanceof Array && function(d, b) {
            d.__proto__ = b;
        } || function(d, b) {
            for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
        return extendStatics(d, b);
    };
    return function(d, b) {
        if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseFeed = exports.FeedHandler = void 0;
var domhandler_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domhandler/lib/index.js [app-route] (ecmascript)"));
var DomUtils = __importStar(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/index.js [app-route] (ecmascript)"));
var Parser_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/lib/Parser.js [app-route] (ecmascript)");
var FeedItemMediaMedium;
(function(FeedItemMediaMedium) {
    FeedItemMediaMedium[FeedItemMediaMedium["image"] = 0] = "image";
    FeedItemMediaMedium[FeedItemMediaMedium["audio"] = 1] = "audio";
    FeedItemMediaMedium[FeedItemMediaMedium["video"] = 2] = "video";
    FeedItemMediaMedium[FeedItemMediaMedium["document"] = 3] = "document";
    FeedItemMediaMedium[FeedItemMediaMedium["executable"] = 4] = "executable";
})(FeedItemMediaMedium || (FeedItemMediaMedium = {}));
var FeedItemMediaExpression;
(function(FeedItemMediaExpression) {
    FeedItemMediaExpression[FeedItemMediaExpression["sample"] = 0] = "sample";
    FeedItemMediaExpression[FeedItemMediaExpression["full"] = 1] = "full";
    FeedItemMediaExpression[FeedItemMediaExpression["nonstop"] = 2] = "nonstop";
})(FeedItemMediaExpression || (FeedItemMediaExpression = {}));
// TODO: Consume data as it is coming in
var FeedHandler = function(_super) {
    __extends(FeedHandler, _super);
    /**
     *
     * @param callback
     * @param options
     */ function FeedHandler(callback, options) {
        var _this = this;
        if (typeof callback === "object") {
            callback = undefined;
            options = callback;
        }
        _this = _super.call(this, callback, options) || this;
        return _this;
    }
    FeedHandler.prototype.onend = function() {
        var _a, _b;
        var feedRoot = getOneElement(isValidFeed, this.dom);
        if (!feedRoot) {
            this.handleCallback(new Error("couldn't find root of feed"));
            return;
        }
        var feed = {};
        if (feedRoot.name === "feed") {
            var childs = feedRoot.children;
            feed.type = "atom";
            addConditionally(feed, "id", "id", childs);
            addConditionally(feed, "title", "title", childs);
            var href = getAttribute("href", getOneElement("link", childs));
            if (href) {
                feed.link = href;
            }
            addConditionally(feed, "description", "subtitle", childs);
            var updated = fetch("updated", childs);
            if (updated) {
                feed.updated = new Date(updated);
            }
            addConditionally(feed, "author", "email", childs, true);
            feed.items = getElements("entry", childs).map(function(item) {
                var entry = {};
                var children = item.children;
                addConditionally(entry, "id", "id", children);
                addConditionally(entry, "title", "title", children);
                var href = getAttribute("href", getOneElement("link", children));
                if (href) {
                    entry.link = href;
                }
                var description = fetch("summary", children) || fetch("content", children);
                if (description) {
                    entry.description = description;
                }
                var pubDate = fetch("updated", children);
                if (pubDate) {
                    entry.pubDate = new Date(pubDate);
                }
                entry.media = getMediaElements(children);
                return entry;
            });
        } else {
            var childs = (_b = (_a = getOneElement("channel", feedRoot.children)) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : [];
            feed.type = feedRoot.name.substr(0, 3);
            feed.id = "";
            addConditionally(feed, "title", "title", childs);
            addConditionally(feed, "link", "link", childs);
            addConditionally(feed, "description", "description", childs);
            var updated = fetch("lastBuildDate", childs);
            if (updated) {
                feed.updated = new Date(updated);
            }
            addConditionally(feed, "author", "managingEditor", childs, true);
            feed.items = getElements("item", feedRoot.children).map(function(item) {
                var entry = {};
                var children = item.children;
                addConditionally(entry, "id", "guid", children);
                addConditionally(entry, "title", "title", children);
                addConditionally(entry, "link", "link", children);
                addConditionally(entry, "description", "description", children);
                var pubDate = fetch("pubDate", children);
                if (pubDate) entry.pubDate = new Date(pubDate);
                entry.media = getMediaElements(children);
                return entry;
            });
        }
        this.feed = feed;
        this.handleCallback(null);
    };
    return FeedHandler;
}(domhandler_1.default);
exports.FeedHandler = FeedHandler;
function getMediaElements(where) {
    return getElements("media:content", where).map(function(elem) {
        var media = {
            medium: elem.attribs.medium,
            isDefault: !!elem.attribs.isDefault
        };
        if (elem.attribs.url) {
            media.url = elem.attribs.url;
        }
        if (elem.attribs.fileSize) {
            media.fileSize = parseInt(elem.attribs.fileSize, 10);
        }
        if (elem.attribs.type) {
            media.type = elem.attribs.type;
        }
        if (elem.attribs.expression) {
            media.expression = elem.attribs.expression;
        }
        if (elem.attribs.bitrate) {
            media.bitrate = parseInt(elem.attribs.bitrate, 10);
        }
        if (elem.attribs.framerate) {
            media.framerate = parseInt(elem.attribs.framerate, 10);
        }
        if (elem.attribs.samplingrate) {
            media.samplingrate = parseInt(elem.attribs.samplingrate, 10);
        }
        if (elem.attribs.channels) {
            media.channels = parseInt(elem.attribs.channels, 10);
        }
        if (elem.attribs.duration) {
            media.duration = parseInt(elem.attribs.duration, 10);
        }
        if (elem.attribs.height) {
            media.height = parseInt(elem.attribs.height, 10);
        }
        if (elem.attribs.width) {
            media.width = parseInt(elem.attribs.width, 10);
        }
        if (elem.attribs.lang) {
            media.lang = elem.attribs.lang;
        }
        return media;
    });
}
function getElements(tagName, where) {
    return DomUtils.getElementsByTagName(tagName, where, true);
}
function getOneElement(tagName, node) {
    return DomUtils.getElementsByTagName(tagName, node, true, 1)[0];
}
function fetch(tagName, where, recurse) {
    if (recurse === void 0) {
        recurse = false;
    }
    return DomUtils.getText(DomUtils.getElementsByTagName(tagName, where, recurse, 1)).trim();
}
function getAttribute(name, elem) {
    if (!elem) {
        return null;
    }
    var attribs = elem.attribs;
    return attribs[name];
}
function addConditionally(obj, prop, what, where, recurse) {
    if (recurse === void 0) {
        recurse = false;
    }
    var tmp = fetch(what, where, recurse);
    if (tmp) obj[prop] = tmp;
}
function isValidFeed(value) {
    return value === "rss" || value === "feed" || value === "rdf:RDF";
}
/**
 * Parse a feed.
 *
 * @param feed The feed that should be parsed, as a string.
 * @param options Optionally, options for parsing. When using this option, you should set `xmlMode` to `true`.
 */ function parseFeed(feed, options) {
    if (options === void 0) {
        options = {
            xmlMode: true
        };
    }
    var handler = new FeedHandler(options);
    new Parser_1.Parser(handler, options).end(feed);
    return handler.feed;
}
exports.parseFeed = parseFeed;
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/lib/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
var __importDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RssHandler = exports.DefaultHandler = exports.DomUtils = exports.ElementType = exports.Tokenizer = exports.createDomStream = exports.parseDOM = exports.parseDocument = exports.DomHandler = exports.Parser = void 0;
var Parser_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/lib/Parser.js [app-route] (ecmascript)");
Object.defineProperty(exports, "Parser", {
    enumerable: true,
    get: function() {
        return Parser_1.Parser;
    }
});
var domhandler_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domhandler/lib/index.js [app-route] (ecmascript)");
Object.defineProperty(exports, "DomHandler", {
    enumerable: true,
    get: function() {
        return domhandler_1.DomHandler;
    }
});
Object.defineProperty(exports, "DefaultHandler", {
    enumerable: true,
    get: function() {
        return domhandler_1.DomHandler;
    }
});
// Helper methods
/**
 * Parses the data, returns the resulting document.
 *
 * @param data The data that should be parsed.
 * @param options Optional options for the parser and DOM builder.
 */ function parseDocument(data, options) {
    var handler = new domhandler_1.DomHandler(undefined, options);
    new Parser_1.Parser(handler, options).end(data);
    return handler.root;
}
exports.parseDocument = parseDocument;
/**
 * Parses data, returns an array of the root nodes.
 *
 * Note that the root nodes still have a `Document` node as their parent.
 * Use `parseDocument` to get the `Document` node instead.
 *
 * @param data The data that should be parsed.
 * @param options Optional options for the parser and DOM builder.
 * @deprecated Use `parseDocument` instead.
 */ function parseDOM(data, options) {
    return parseDocument(data, options).children;
}
exports.parseDOM = parseDOM;
/**
 * Creates a parser instance, with an attached DOM handler.
 *
 * @param cb A callback that will be called once parsing has been completed.
 * @param options Optional options for the parser and DOM builder.
 * @param elementCb An optional callback that will be called every time a tag has been completed inside of the DOM.
 */ function createDomStream(cb, options, elementCb) {
    var handler = new domhandler_1.DomHandler(cb, options, elementCb);
    return new Parser_1.Parser(handler, options);
}
exports.createDomStream = createDomStream;
var Tokenizer_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/lib/Tokenizer.js [app-route] (ecmascript)");
Object.defineProperty(exports, "Tokenizer", {
    enumerable: true,
    get: function() {
        return __importDefault(Tokenizer_1).default;
    }
});
var ElementType = __importStar(__turbopack_context__.r("[project]/node_modules/domelementtype/lib/index.js [app-route] (ecmascript)"));
exports.ElementType = ElementType;
/*
 * All of the following exports exist for backwards-compatibility.
 * They should probably be removed eventually.
 */ __exportStar(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/lib/FeedHandler.js [app-route] (ecmascript)"), exports);
exports.DomUtils = __importStar(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/index.js [app-route] (ecmascript)"));
var FeedHandler_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/lib/FeedHandler.js [app-route] (ecmascript)");
Object.defineProperty(exports, "RssHandler", {
    enumerable: true,
    get: function() {
        return FeedHandler_1.FeedHandler;
    }
});
}),
"[project]/node_modules/domelementtype/lib/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Doctype = exports.CDATA = exports.Tag = exports.Style = exports.Script = exports.Comment = exports.Directive = exports.Text = exports.Root = exports.isTag = exports.ElementType = void 0;
/** Types of elements found in htmlparser2's DOM */ var ElementType;
(function(ElementType) {
    /** Type for the root element of a document */ ElementType["Root"] = "root";
    /** Type for Text */ ElementType["Text"] = "text";
    /** Type for <? ... ?> */ ElementType["Directive"] = "directive";
    /** Type for <!-- ... --> */ ElementType["Comment"] = "comment";
    /** Type for <script> tags */ ElementType["Script"] = "script";
    /** Type for <style> tags */ ElementType["Style"] = "style";
    /** Type for Any tag */ ElementType["Tag"] = "tag";
    /** Type for <![CDATA[ ... ]]> */ ElementType["CDATA"] = "cdata";
    /** Type for <!doctype ...> */ ElementType["Doctype"] = "doctype";
})(ElementType = exports.ElementType || (exports.ElementType = {}));
/**
 * Tests whether an element is a tag or not.
 *
 * @param elem Element to test
 */ function isTag(elem) {
    return elem.type === ElementType.Tag || elem.type === ElementType.Script || elem.type === ElementType.Style;
}
exports.isTag = isTag;
// Exports for backwards compatibility
/** Type for the root element of a document */ exports.Root = ElementType.Root;
/** Type for Text */ exports.Text = ElementType.Text;
/** Type for <? ... ?> */ exports.Directive = ElementType.Directive;
/** Type for <!-- ... --> */ exports.Comment = ElementType.Comment;
/** Type for <script> tags */ exports.Script = ElementType.Script;
/** Type for <style> tags */ exports.Style = ElementType.Style;
/** Type for Any tag */ exports.Tag = ElementType.Tag;
/** Type for <![CDATA[ ... ]]> */ exports.CDATA = ElementType.CDATA;
/** Type for <!doctype ...> */ exports.Doctype = ElementType.Doctype;
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domhandler/lib/node.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __extends = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__extends || function() {
    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || ({
            __proto__: []
        }) instanceof Array && function(d, b) {
            d.__proto__ = b;
        } || function(d, b) {
            for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
        return extendStatics(d, b);
    };
    return function(d, b) {
        if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
var __assign = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__assign || function() {
    __assign = Object.assign || function(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.cloneNode = exports.hasChildren = exports.isDocument = exports.isDirective = exports.isComment = exports.isText = exports.isCDATA = exports.isTag = exports.Element = exports.Document = exports.NodeWithChildren = exports.ProcessingInstruction = exports.Comment = exports.Text = exports.DataNode = exports.Node = void 0;
var domelementtype_1 = __turbopack_context__.r("[project]/node_modules/domelementtype/lib/index.js [app-route] (ecmascript)");
var nodeTypes = new Map([
    [
        domelementtype_1.ElementType.Tag,
        1
    ],
    [
        domelementtype_1.ElementType.Script,
        1
    ],
    [
        domelementtype_1.ElementType.Style,
        1
    ],
    [
        domelementtype_1.ElementType.Directive,
        1
    ],
    [
        domelementtype_1.ElementType.Text,
        3
    ],
    [
        domelementtype_1.ElementType.CDATA,
        4
    ],
    [
        domelementtype_1.ElementType.Comment,
        8
    ],
    [
        domelementtype_1.ElementType.Root,
        9
    ]
]);
/**
 * This object will be used as the prototype for Nodes when creating a
 * DOM-Level-1-compliant structure.
 */ var Node = function() {
    /**
     *
     * @param type The type of the node.
     */ function Node(type) {
        this.type = type;
        /** Parent of the node */ this.parent = null;
        /** Previous sibling */ this.prev = null;
        /** Next sibling */ this.next = null;
        /** The start index of the node. Requires `withStartIndices` on the handler to be `true. */ this.startIndex = null;
        /** The end index of the node. Requires `withEndIndices` on the handler to be `true. */ this.endIndex = null;
    }
    Object.defineProperty(Node.prototype, "nodeType", {
        // Read-only aliases
        /**
         * [DOM spec](https://dom.spec.whatwg.org/#dom-node-nodetype)-compatible
         * node {@link type}.
         */ get: function() {
            var _a;
            return (_a = nodeTypes.get(this.type)) !== null && _a !== void 0 ? _a : 1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "parentNode", {
        // Read-write aliases for properties
        /**
         * Same as {@link parent}.
         * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
         */ get: function() {
            return this.parent;
        },
        set: function(parent) {
            this.parent = parent;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "previousSibling", {
        /**
         * Same as {@link prev}.
         * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
         */ get: function() {
            return this.prev;
        },
        set: function(prev) {
            this.prev = prev;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "nextSibling", {
        /**
         * Same as {@link next}.
         * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
         */ get: function() {
            return this.next;
        },
        set: function(next) {
            this.next = next;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Clone this node, and optionally its children.
     *
     * @param recursive Clone child nodes as well.
     * @returns A clone of the node.
     */ Node.prototype.cloneNode = function(recursive) {
        if (recursive === void 0) {
            recursive = false;
        }
        return cloneNode(this, recursive);
    };
    return Node;
}();
exports.Node = Node;
/**
 * A node that contains some data.
 */ var DataNode = function(_super) {
    __extends(DataNode, _super);
    /**
     * @param type The type of the node
     * @param data The content of the data node
     */ function DataNode(type, data) {
        var _this = _super.call(this, type) || this;
        _this.data = data;
        return _this;
    }
    Object.defineProperty(DataNode.prototype, "nodeValue", {
        /**
         * Same as {@link data}.
         * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
         */ get: function() {
            return this.data;
        },
        set: function(data) {
            this.data = data;
        },
        enumerable: false,
        configurable: true
    });
    return DataNode;
}(Node);
exports.DataNode = DataNode;
/**
 * Text within the document.
 */ var Text = function(_super) {
    __extends(Text, _super);
    function Text(data) {
        return _super.call(this, domelementtype_1.ElementType.Text, data) || this;
    }
    return Text;
}(DataNode);
exports.Text = Text;
/**
 * Comments within the document.
 */ var Comment = function(_super) {
    __extends(Comment, _super);
    function Comment(data) {
        return _super.call(this, domelementtype_1.ElementType.Comment, data) || this;
    }
    return Comment;
}(DataNode);
exports.Comment = Comment;
/**
 * Processing instructions, including doc types.
 */ var ProcessingInstruction = function(_super) {
    __extends(ProcessingInstruction, _super);
    function ProcessingInstruction(name, data) {
        var _this = _super.call(this, domelementtype_1.ElementType.Directive, data) || this;
        _this.name = name;
        return _this;
    }
    return ProcessingInstruction;
}(DataNode);
exports.ProcessingInstruction = ProcessingInstruction;
/**
 * A `Node` that can have children.
 */ var NodeWithChildren = function(_super) {
    __extends(NodeWithChildren, _super);
    /**
     * @param type Type of the node.
     * @param children Children of the node. Only certain node types can have children.
     */ function NodeWithChildren(type, children) {
        var _this = _super.call(this, type) || this;
        _this.children = children;
        return _this;
    }
    Object.defineProperty(NodeWithChildren.prototype, "firstChild", {
        // Aliases
        /** First child of the node. */ get: function() {
            var _a;
            return (_a = this.children[0]) !== null && _a !== void 0 ? _a : null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeWithChildren.prototype, "lastChild", {
        /** Last child of the node. */ get: function() {
            return this.children.length > 0 ? this.children[this.children.length - 1] : null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeWithChildren.prototype, "childNodes", {
        /**
         * Same as {@link children}.
         * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
         */ get: function() {
            return this.children;
        },
        set: function(children) {
            this.children = children;
        },
        enumerable: false,
        configurable: true
    });
    return NodeWithChildren;
}(Node);
exports.NodeWithChildren = NodeWithChildren;
/**
 * The root node of the document.
 */ var Document = function(_super) {
    __extends(Document, _super);
    function Document(children) {
        return _super.call(this, domelementtype_1.ElementType.Root, children) || this;
    }
    return Document;
}(NodeWithChildren);
exports.Document = Document;
/**
 * An element within the DOM.
 */ var Element = function(_super) {
    __extends(Element, _super);
    /**
     * @param name Name of the tag, eg. `div`, `span`.
     * @param attribs Object mapping attribute names to attribute values.
     * @param children Children of the node.
     */ function Element(name, attribs, children, type) {
        if (children === void 0) {
            children = [];
        }
        if (type === void 0) {
            type = name === "script" ? domelementtype_1.ElementType.Script : name === "style" ? domelementtype_1.ElementType.Style : domelementtype_1.ElementType.Tag;
        }
        var _this = _super.call(this, type, children) || this;
        _this.name = name;
        _this.attribs = attribs;
        return _this;
    }
    Object.defineProperty(Element.prototype, "tagName", {
        // DOM Level 1 aliases
        /**
         * Same as {@link name}.
         * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
         */ get: function() {
            return this.name;
        },
        set: function(name) {
            this.name = name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "attributes", {
        get: function() {
            var _this = this;
            return Object.keys(this.attribs).map(function(name) {
                var _a, _b;
                return {
                    name: name,
                    value: _this.attribs[name],
                    namespace: (_a = _this["x-attribsNamespace"]) === null || _a === void 0 ? void 0 : _a[name],
                    prefix: (_b = _this["x-attribsPrefix"]) === null || _b === void 0 ? void 0 : _b[name]
                };
            });
        },
        enumerable: false,
        configurable: true
    });
    return Element;
}(NodeWithChildren);
exports.Element = Element;
/**
 * @param node Node to check.
 * @returns `true` if the node is a `Element`, `false` otherwise.
 */ function isTag(node) {
    return (0, domelementtype_1.isTag)(node);
}
exports.isTag = isTag;
/**
 * @param node Node to check.
 * @returns `true` if the node has the type `CDATA`, `false` otherwise.
 */ function isCDATA(node) {
    return node.type === domelementtype_1.ElementType.CDATA;
}
exports.isCDATA = isCDATA;
/**
 * @param node Node to check.
 * @returns `true` if the node has the type `Text`, `false` otherwise.
 */ function isText(node) {
    return node.type === domelementtype_1.ElementType.Text;
}
exports.isText = isText;
/**
 * @param node Node to check.
 * @returns `true` if the node has the type `Comment`, `false` otherwise.
 */ function isComment(node) {
    return node.type === domelementtype_1.ElementType.Comment;
}
exports.isComment = isComment;
/**
 * @param node Node to check.
 * @returns `true` if the node has the type `ProcessingInstruction`, `false` otherwise.
 */ function isDirective(node) {
    return node.type === domelementtype_1.ElementType.Directive;
}
exports.isDirective = isDirective;
/**
 * @param node Node to check.
 * @returns `true` if the node has the type `ProcessingInstruction`, `false` otherwise.
 */ function isDocument(node) {
    return node.type === domelementtype_1.ElementType.Root;
}
exports.isDocument = isDocument;
/**
 * @param node Node to check.
 * @returns `true` if the node is a `NodeWithChildren` (has children), `false` otherwise.
 */ function hasChildren(node) {
    return Object.prototype.hasOwnProperty.call(node, "children");
}
exports.hasChildren = hasChildren;
/**
 * Clone a node, and optionally its children.
 *
 * @param recursive Clone child nodes as well.
 * @returns A clone of the node.
 */ function cloneNode(node, recursive) {
    if (recursive === void 0) {
        recursive = false;
    }
    var result;
    if (isText(node)) {
        result = new Text(node.data);
    } else if (isComment(node)) {
        result = new Comment(node.data);
    } else if (isTag(node)) {
        var children = recursive ? cloneChildren(node.children) : [];
        var clone_1 = new Element(node.name, __assign({}, node.attribs), children);
        children.forEach(function(child) {
            return child.parent = clone_1;
        });
        if (node.namespace != null) {
            clone_1.namespace = node.namespace;
        }
        if (node["x-attribsNamespace"]) {
            clone_1["x-attribsNamespace"] = __assign({}, node["x-attribsNamespace"]);
        }
        if (node["x-attribsPrefix"]) {
            clone_1["x-attribsPrefix"] = __assign({}, node["x-attribsPrefix"]);
        }
        result = clone_1;
    } else if (isCDATA(node)) {
        var children = recursive ? cloneChildren(node.children) : [];
        var clone_2 = new NodeWithChildren(domelementtype_1.ElementType.CDATA, children);
        children.forEach(function(child) {
            return child.parent = clone_2;
        });
        result = clone_2;
    } else if (isDocument(node)) {
        var children = recursive ? cloneChildren(node.children) : [];
        var clone_3 = new Document(children);
        children.forEach(function(child) {
            return child.parent = clone_3;
        });
        if (node["x-mode"]) {
            clone_3["x-mode"] = node["x-mode"];
        }
        result = clone_3;
    } else if (isDirective(node)) {
        var instruction = new ProcessingInstruction(node.name, node.data);
        if (node["x-name"] != null) {
            instruction["x-name"] = node["x-name"];
            instruction["x-publicId"] = node["x-publicId"];
            instruction["x-systemId"] = node["x-systemId"];
        }
        result = instruction;
    } else {
        throw new Error("Not implemented yet: ".concat(node.type));
    }
    result.startIndex = node.startIndex;
    result.endIndex = node.endIndex;
    if (node.sourceCodeLocation != null) {
        result.sourceCodeLocation = node.sourceCodeLocation;
    }
    return result;
}
exports.cloneNode = cloneNode;
function cloneChildren(childs) {
    var children = childs.map(function(child) {
        return cloneNode(child, true);
    });
    for(var i = 1; i < children.length; i++){
        children[i].prev = children[i - 1];
        children[i - 1].next = children[i];
    }
    return children;
}
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domhandler/lib/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DomHandler = void 0;
var domelementtype_1 = __turbopack_context__.r("[project]/node_modules/domelementtype/lib/index.js [app-route] (ecmascript)");
var node_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domhandler/lib/node.js [app-route] (ecmascript)");
__exportStar(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domhandler/lib/node.js [app-route] (ecmascript)"), exports);
var reWhitespace = /\s+/g;
// Default options
var defaultOpts = {
    normalizeWhitespace: false,
    withStartIndices: false,
    withEndIndices: false,
    xmlMode: false
};
var DomHandler = function() {
    /**
     * @param callback Called once parsing has completed.
     * @param options Settings for the handler.
     * @param elementCB Callback whenever a tag is closed.
     */ function DomHandler(callback, options, elementCB) {
        /** The elements of the DOM */ this.dom = [];
        /** The root element for the DOM */ this.root = new node_1.Document(this.dom);
        /** Indicated whether parsing has been completed. */ this.done = false;
        /** Stack of open tags. */ this.tagStack = [
            this.root
        ];
        /** A data node that is still being written to. */ this.lastNode = null;
        /** Reference to the parser instance. Used for location information. */ this.parser = null;
        // Make it possible to skip arguments, for backwards-compatibility
        if (typeof options === "function") {
            elementCB = options;
            options = defaultOpts;
        }
        if (typeof callback === "object") {
            options = callback;
            callback = undefined;
        }
        this.callback = callback !== null && callback !== void 0 ? callback : null;
        this.options = options !== null && options !== void 0 ? options : defaultOpts;
        this.elementCB = elementCB !== null && elementCB !== void 0 ? elementCB : null;
    }
    DomHandler.prototype.onparserinit = function(parser) {
        this.parser = parser;
    };
    // Resets the handler back to starting state
    DomHandler.prototype.onreset = function() {
        this.dom = [];
        this.root = new node_1.Document(this.dom);
        this.done = false;
        this.tagStack = [
            this.root
        ];
        this.lastNode = null;
        this.parser = null;
    };
    // Signals the handler that parsing is done
    DomHandler.prototype.onend = function() {
        if (this.done) return;
        this.done = true;
        this.parser = null;
        this.handleCallback(null);
    };
    DomHandler.prototype.onerror = function(error) {
        this.handleCallback(error);
    };
    DomHandler.prototype.onclosetag = function() {
        this.lastNode = null;
        var elem = this.tagStack.pop();
        if (this.options.withEndIndices) {
            elem.endIndex = this.parser.endIndex;
        }
        if (this.elementCB) this.elementCB(elem);
    };
    DomHandler.prototype.onopentag = function(name, attribs) {
        var type = this.options.xmlMode ? domelementtype_1.ElementType.Tag : undefined;
        var element = new node_1.Element(name, attribs, undefined, type);
        this.addNode(element);
        this.tagStack.push(element);
    };
    DomHandler.prototype.ontext = function(data) {
        var normalizeWhitespace = this.options.normalizeWhitespace;
        var lastNode = this.lastNode;
        if (lastNode && lastNode.type === domelementtype_1.ElementType.Text) {
            if (normalizeWhitespace) {
                lastNode.data = (lastNode.data + data).replace(reWhitespace, " ");
            } else {
                lastNode.data += data;
            }
            if (this.options.withEndIndices) {
                lastNode.endIndex = this.parser.endIndex;
            }
        } else {
            if (normalizeWhitespace) {
                data = data.replace(reWhitespace, " ");
            }
            var node = new node_1.Text(data);
            this.addNode(node);
            this.lastNode = node;
        }
    };
    DomHandler.prototype.oncomment = function(data) {
        if (this.lastNode && this.lastNode.type === domelementtype_1.ElementType.Comment) {
            this.lastNode.data += data;
            return;
        }
        var node = new node_1.Comment(data);
        this.addNode(node);
        this.lastNode = node;
    };
    DomHandler.prototype.oncommentend = function() {
        this.lastNode = null;
    };
    DomHandler.prototype.oncdatastart = function() {
        var text = new node_1.Text("");
        var node = new node_1.NodeWithChildren(domelementtype_1.ElementType.CDATA, [
            text
        ]);
        this.addNode(node);
        text.parent = node;
        this.lastNode = text;
    };
    DomHandler.prototype.oncdataend = function() {
        this.lastNode = null;
    };
    DomHandler.prototype.onprocessinginstruction = function(name, data) {
        var node = new node_1.ProcessingInstruction(name, data);
        this.addNode(node);
    };
    DomHandler.prototype.handleCallback = function(error) {
        if (typeof this.callback === "function") {
            this.callback(error, this.dom);
        } else if (error) {
            throw error;
        }
    };
    DomHandler.prototype.addNode = function(node) {
        var parent = this.tagStack[this.tagStack.length - 1];
        var previousSibling = parent.children[parent.children.length - 1];
        if (this.options.withStartIndices) {
            node.startIndex = this.parser.startIndex;
        }
        if (this.options.withEndIndices) {
            node.endIndex = this.parser.endIndex;
        }
        parent.children.push(node);
        if (previousSibling) {
            node.prev = previousSibling;
            previousSibling.next = node;
        }
        node.parent = parent;
        this.lastNode = null;
    };
    return DomHandler;
}();
exports.DomHandler = DomHandler;
exports.default = DomHandler;
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/node_modules/dom-serializer/lib/foreignNames.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.attributeNames = exports.elementNames = void 0;
exports.elementNames = new Map([
    [
        "altglyph",
        "altGlyph"
    ],
    [
        "altglyphdef",
        "altGlyphDef"
    ],
    [
        "altglyphitem",
        "altGlyphItem"
    ],
    [
        "animatecolor",
        "animateColor"
    ],
    [
        "animatemotion",
        "animateMotion"
    ],
    [
        "animatetransform",
        "animateTransform"
    ],
    [
        "clippath",
        "clipPath"
    ],
    [
        "feblend",
        "feBlend"
    ],
    [
        "fecolormatrix",
        "feColorMatrix"
    ],
    [
        "fecomponenttransfer",
        "feComponentTransfer"
    ],
    [
        "fecomposite",
        "feComposite"
    ],
    [
        "feconvolvematrix",
        "feConvolveMatrix"
    ],
    [
        "fediffuselighting",
        "feDiffuseLighting"
    ],
    [
        "fedisplacementmap",
        "feDisplacementMap"
    ],
    [
        "fedistantlight",
        "feDistantLight"
    ],
    [
        "fedropshadow",
        "feDropShadow"
    ],
    [
        "feflood",
        "feFlood"
    ],
    [
        "fefunca",
        "feFuncA"
    ],
    [
        "fefuncb",
        "feFuncB"
    ],
    [
        "fefuncg",
        "feFuncG"
    ],
    [
        "fefuncr",
        "feFuncR"
    ],
    [
        "fegaussianblur",
        "feGaussianBlur"
    ],
    [
        "feimage",
        "feImage"
    ],
    [
        "femerge",
        "feMerge"
    ],
    [
        "femergenode",
        "feMergeNode"
    ],
    [
        "femorphology",
        "feMorphology"
    ],
    [
        "feoffset",
        "feOffset"
    ],
    [
        "fepointlight",
        "fePointLight"
    ],
    [
        "fespecularlighting",
        "feSpecularLighting"
    ],
    [
        "fespotlight",
        "feSpotLight"
    ],
    [
        "fetile",
        "feTile"
    ],
    [
        "feturbulence",
        "feTurbulence"
    ],
    [
        "foreignobject",
        "foreignObject"
    ],
    [
        "glyphref",
        "glyphRef"
    ],
    [
        "lineargradient",
        "linearGradient"
    ],
    [
        "radialgradient",
        "radialGradient"
    ],
    [
        "textpath",
        "textPath"
    ]
]);
exports.attributeNames = new Map([
    [
        "definitionurl",
        "definitionURL"
    ],
    [
        "attributename",
        "attributeName"
    ],
    [
        "attributetype",
        "attributeType"
    ],
    [
        "basefrequency",
        "baseFrequency"
    ],
    [
        "baseprofile",
        "baseProfile"
    ],
    [
        "calcmode",
        "calcMode"
    ],
    [
        "clippathunits",
        "clipPathUnits"
    ],
    [
        "diffuseconstant",
        "diffuseConstant"
    ],
    [
        "edgemode",
        "edgeMode"
    ],
    [
        "filterunits",
        "filterUnits"
    ],
    [
        "glyphref",
        "glyphRef"
    ],
    [
        "gradienttransform",
        "gradientTransform"
    ],
    [
        "gradientunits",
        "gradientUnits"
    ],
    [
        "kernelmatrix",
        "kernelMatrix"
    ],
    [
        "kernelunitlength",
        "kernelUnitLength"
    ],
    [
        "keypoints",
        "keyPoints"
    ],
    [
        "keysplines",
        "keySplines"
    ],
    [
        "keytimes",
        "keyTimes"
    ],
    [
        "lengthadjust",
        "lengthAdjust"
    ],
    [
        "limitingconeangle",
        "limitingConeAngle"
    ],
    [
        "markerheight",
        "markerHeight"
    ],
    [
        "markerunits",
        "markerUnits"
    ],
    [
        "markerwidth",
        "markerWidth"
    ],
    [
        "maskcontentunits",
        "maskContentUnits"
    ],
    [
        "maskunits",
        "maskUnits"
    ],
    [
        "numoctaves",
        "numOctaves"
    ],
    [
        "pathlength",
        "pathLength"
    ],
    [
        "patterncontentunits",
        "patternContentUnits"
    ],
    [
        "patterntransform",
        "patternTransform"
    ],
    [
        "patternunits",
        "patternUnits"
    ],
    [
        "pointsatx",
        "pointsAtX"
    ],
    [
        "pointsaty",
        "pointsAtY"
    ],
    [
        "pointsatz",
        "pointsAtZ"
    ],
    [
        "preservealpha",
        "preserveAlpha"
    ],
    [
        "preserveaspectratio",
        "preserveAspectRatio"
    ],
    [
        "primitiveunits",
        "primitiveUnits"
    ],
    [
        "refx",
        "refX"
    ],
    [
        "refy",
        "refY"
    ],
    [
        "repeatcount",
        "repeatCount"
    ],
    [
        "repeatdur",
        "repeatDur"
    ],
    [
        "requiredextensions",
        "requiredExtensions"
    ],
    [
        "requiredfeatures",
        "requiredFeatures"
    ],
    [
        "specularconstant",
        "specularConstant"
    ],
    [
        "specularexponent",
        "specularExponent"
    ],
    [
        "spreadmethod",
        "spreadMethod"
    ],
    [
        "startoffset",
        "startOffset"
    ],
    [
        "stddeviation",
        "stdDeviation"
    ],
    [
        "stitchtiles",
        "stitchTiles"
    ],
    [
        "surfacescale",
        "surfaceScale"
    ],
    [
        "systemlanguage",
        "systemLanguage"
    ],
    [
        "tablevalues",
        "tableValues"
    ],
    [
        "targetx",
        "targetX"
    ],
    [
        "targety",
        "targetY"
    ],
    [
        "textlength",
        "textLength"
    ],
    [
        "viewbox",
        "viewBox"
    ],
    [
        "viewtarget",
        "viewTarget"
    ],
    [
        "xchannelselector",
        "xChannelSelector"
    ],
    [
        "ychannelselector",
        "yChannelSelector"
    ],
    [
        "zoomandpan",
        "zoomAndPan"
    ]
]);
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/node_modules/dom-serializer/lib/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __assign = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__assign || function() {
    __assign = Object.assign || function(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
/*
 * Module dependencies
 */ var ElementType = __importStar(__turbopack_context__.r("[project]/node_modules/domelementtype/lib/index.js [app-route] (ecmascript)"));
var entities_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/entities/lib/index.js [app-route] (ecmascript)");
/**
 * Mixed-case SVG and MathML tags & attributes
 * recognized by the HTML parser.
 *
 * @see https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inforeign
 */ var foreignNames_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/node_modules/dom-serializer/lib/foreignNames.js [app-route] (ecmascript)");
var unencodedElements = new Set([
    "style",
    "script",
    "xmp",
    "iframe",
    "noembed",
    "noframes",
    "plaintext",
    "noscript"
]);
/**
 * Format attributes
 */ function formatAttributes(attributes, opts) {
    if (!attributes) return;
    return Object.keys(attributes).map(function(key) {
        var _a, _b;
        var value = (_a = attributes[key]) !== null && _a !== void 0 ? _a : "";
        if (opts.xmlMode === "foreign") {
            /* Fix up mixed-case attribute names */ key = (_b = foreignNames_1.attributeNames.get(key)) !== null && _b !== void 0 ? _b : key;
        }
        if (!opts.emptyAttrs && !opts.xmlMode && value === "") {
            return key;
        }
        return key + "=\"" + (opts.decodeEntities !== false ? entities_1.encodeXML(value) : value.replace(/"/g, "&quot;")) + "\"";
    }).join(" ");
}
/**
 * Self-enclosing tags
 */ var singleTag = new Set([
    "area",
    "base",
    "basefont",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
]);
/**
 * Renders a DOM node or an array of DOM nodes to a string.
 *
 * Can be thought of as the equivalent of the `outerHTML` of the passed node(s).
 *
 * @param node Node to be rendered.
 * @param options Changes serialization behavior
 */ function render(node, options) {
    if (options === void 0) {
        options = {};
    }
    var nodes = "length" in node ? node : [
        node
    ];
    var output = "";
    for(var i = 0; i < nodes.length; i++){
        output += renderNode(nodes[i], options);
    }
    return output;
}
exports.default = render;
function renderNode(node, options) {
    switch(node.type){
        case ElementType.Root:
            return render(node.children, options);
        case ElementType.Directive:
        case ElementType.Doctype:
            return renderDirective(node);
        case ElementType.Comment:
            return renderComment(node);
        case ElementType.CDATA:
            return renderCdata(node);
        case ElementType.Script:
        case ElementType.Style:
        case ElementType.Tag:
            return renderTag(node, options);
        case ElementType.Text:
            return renderText(node, options);
    }
}
var foreignModeIntegrationPoints = new Set([
    "mi",
    "mo",
    "mn",
    "ms",
    "mtext",
    "annotation-xml",
    "foreignObject",
    "desc",
    "title"
]);
var foreignElements = new Set([
    "svg",
    "math"
]);
function renderTag(elem, opts) {
    var _a;
    // Handle SVG / MathML in HTML
    if (opts.xmlMode === "foreign") {
        /* Fix up mixed-case element names */ elem.name = (_a = foreignNames_1.elementNames.get(elem.name)) !== null && _a !== void 0 ? _a : elem.name;
        /* Exit foreign mode at integration points */ if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) {
            opts = __assign(__assign({}, opts), {
                xmlMode: false
            });
        }
    }
    if (!opts.xmlMode && foreignElements.has(elem.name)) {
        opts = __assign(__assign({}, opts), {
            xmlMode: "foreign"
        });
    }
    var tag = "<" + elem.name;
    var attribs = formatAttributes(elem.attribs, opts);
    if (attribs) {
        tag += " " + attribs;
    }
    if (elem.children.length === 0 && (opts.xmlMode ? opts.selfClosingTags !== false : opts.selfClosingTags && singleTag.has(elem.name))) {
        if (!opts.xmlMode) tag += " ";
        tag += "/>";
    } else {
        tag += ">";
        if (elem.children.length > 0) {
            tag += render(elem.children, opts);
        }
        if (opts.xmlMode || !singleTag.has(elem.name)) {
            tag += "</" + elem.name + ">";
        }
    }
    return tag;
}
function renderDirective(elem) {
    return "<" + elem.data + ">";
}
function renderText(elem, opts) {
    var data = elem.data || "";
    // If entities weren't decoded, no need to encode them back
    if (opts.decodeEntities !== false && !(!opts.xmlMode && elem.parent && unencodedElements.has(elem.parent.name))) {
        data = entities_1.encodeXML(data);
    }
    return data;
}
function renderCdata(elem) {
    return "<![CDATA[" + elem.children[0].data + "]]>";
}
function renderComment(elem) {
    return "<!--" + elem.data + "-->";
}
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/stringify.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __importDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.innerText = exports.textContent = exports.getText = exports.getInnerHTML = exports.getOuterHTML = void 0;
var domhandler_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domhandler/lib/index.js [app-route] (ecmascript)");
var dom_serializer_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/node_modules/dom-serializer/lib/index.js [app-route] (ecmascript)"));
var domelementtype_1 = __turbopack_context__.r("[project]/node_modules/domelementtype/lib/index.js [app-route] (ecmascript)");
/**
 * @param node Node to get the outer HTML of.
 * @param options Options for serialization.
 * @deprecated Use the `dom-serializer` module directly.
 * @returns `node`'s outer HTML.
 */ function getOuterHTML(node, options) {
    return (0, dom_serializer_1.default)(node, options);
}
exports.getOuterHTML = getOuterHTML;
/**
 * @param node Node to get the inner HTML of.
 * @param options Options for serialization.
 * @deprecated Use the `dom-serializer` module directly.
 * @returns `node`'s inner HTML.
 */ function getInnerHTML(node, options) {
    return (0, domhandler_1.hasChildren)(node) ? node.children.map(function(node) {
        return getOuterHTML(node, options);
    }).join("") : "";
}
exports.getInnerHTML = getInnerHTML;
/**
 * Get a node's inner text. Same as `textContent`, but inserts newlines for `<br>` tags.
 *
 * @deprecated Use `textContent` instead.
 * @param node Node to get the inner text of.
 * @returns `node`'s inner text.
 */ function getText(node) {
    if (Array.isArray(node)) return node.map(getText).join("");
    if ((0, domhandler_1.isTag)(node)) return node.name === "br" ? "\n" : getText(node.children);
    if ((0, domhandler_1.isCDATA)(node)) return getText(node.children);
    if ((0, domhandler_1.isText)(node)) return node.data;
    return "";
}
exports.getText = getText;
/**
 * Get a node's text content.
 *
 * @param node Node to get the text content of.
 * @returns `node`'s text content.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent}
 */ function textContent(node) {
    if (Array.isArray(node)) return node.map(textContent).join("");
    if ((0, domhandler_1.hasChildren)(node) && !(0, domhandler_1.isComment)(node)) {
        return textContent(node.children);
    }
    if ((0, domhandler_1.isText)(node)) return node.data;
    return "";
}
exports.textContent = textContent;
/**
 * Get a node's inner text.
 *
 * @param node Node to get the inner text of.
 * @returns `node`'s inner text.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/innerText}
 */ function innerText(node) {
    if (Array.isArray(node)) return node.map(innerText).join("");
    if ((0, domhandler_1.hasChildren)(node) && (node.type === domelementtype_1.ElementType.Tag || (0, domhandler_1.isCDATA)(node))) {
        return innerText(node.children);
    }
    if ((0, domhandler_1.isText)(node)) return node.data;
    return "";
}
exports.innerText = innerText;
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/traversal.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.prevElementSibling = exports.nextElementSibling = exports.getName = exports.hasAttrib = exports.getAttributeValue = exports.getSiblings = exports.getParent = exports.getChildren = void 0;
var domhandler_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domhandler/lib/index.js [app-route] (ecmascript)");
var emptyArray = [];
/**
 * Get a node's children.
 *
 * @param elem Node to get the children of.
 * @returns `elem`'s children, or an empty array.
 */ function getChildren(elem) {
    var _a;
    return (_a = elem.children) !== null && _a !== void 0 ? _a : emptyArray;
}
exports.getChildren = getChildren;
/**
 * Get a node's parent.
 *
 * @param elem Node to get the parent of.
 * @returns `elem`'s parent node.
 */ function getParent(elem) {
    return elem.parent || null;
}
exports.getParent = getParent;
/**
 * Gets an elements siblings, including the element itself.
 *
 * Attempts to get the children through the element's parent first.
 * If we don't have a parent (the element is a root node),
 * we walk the element's `prev` & `next` to get all remaining nodes.
 *
 * @param elem Element to get the siblings of.
 * @returns `elem`'s siblings.
 */ function getSiblings(elem) {
    var _a, _b;
    var parent = getParent(elem);
    if (parent != null) return getChildren(parent);
    var siblings = [
        elem
    ];
    var prev = elem.prev, next = elem.next;
    while(prev != null){
        siblings.unshift(prev);
        _a = prev, prev = _a.prev;
    }
    while(next != null){
        siblings.push(next);
        _b = next, next = _b.next;
    }
    return siblings;
}
exports.getSiblings = getSiblings;
/**
 * Gets an attribute from an element.
 *
 * @param elem Element to check.
 * @param name Attribute name to retrieve.
 * @returns The element's attribute value, or `undefined`.
 */ function getAttributeValue(elem, name) {
    var _a;
    return (_a = elem.attribs) === null || _a === void 0 ? void 0 : _a[name];
}
exports.getAttributeValue = getAttributeValue;
/**
 * Checks whether an element has an attribute.
 *
 * @param elem Element to check.
 * @param name Attribute name to look for.
 * @returns Returns whether `elem` has the attribute `name`.
 */ function hasAttrib(elem, name) {
    return elem.attribs != null && Object.prototype.hasOwnProperty.call(elem.attribs, name) && elem.attribs[name] != null;
}
exports.hasAttrib = hasAttrib;
/**
 * Get the tag name of an element.
 *
 * @param elem The element to get the name for.
 * @returns The tag name of `elem`.
 */ function getName(elem) {
    return elem.name;
}
exports.getName = getName;
/**
 * Returns the next element sibling of a node.
 *
 * @param elem The element to get the next sibling of.
 * @returns `elem`'s next sibling that is a tag.
 */ function nextElementSibling(elem) {
    var _a;
    var next = elem.next;
    while(next !== null && !(0, domhandler_1.isTag)(next))_a = next, next = _a.next;
    return next;
}
exports.nextElementSibling = nextElementSibling;
/**
 * Returns the previous element sibling of a node.
 *
 * @param elem The element to get the previous sibling of.
 * @returns `elem`'s previous sibling that is a tag.
 */ function prevElementSibling(elem) {
    var _a;
    var prev = elem.prev;
    while(prev !== null && !(0, domhandler_1.isTag)(prev))_a = prev, prev = _a.prev;
    return prev;
}
exports.prevElementSibling = prevElementSibling;
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/manipulation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.prepend = exports.prependChild = exports.append = exports.appendChild = exports.replaceElement = exports.removeElement = void 0;
/**
 * Remove an element from the dom
 *
 * @param elem The element to be removed
 */ function removeElement(elem) {
    if (elem.prev) elem.prev.next = elem.next;
    if (elem.next) elem.next.prev = elem.prev;
    if (elem.parent) {
        var childs = elem.parent.children;
        childs.splice(childs.lastIndexOf(elem), 1);
    }
}
exports.removeElement = removeElement;
/**
 * Replace an element in the dom
 *
 * @param elem The element to be replaced
 * @param replacement The element to be added
 */ function replaceElement(elem, replacement) {
    var prev = replacement.prev = elem.prev;
    if (prev) {
        prev.next = replacement;
    }
    var next = replacement.next = elem.next;
    if (next) {
        next.prev = replacement;
    }
    var parent = replacement.parent = elem.parent;
    if (parent) {
        var childs = parent.children;
        childs[childs.lastIndexOf(elem)] = replacement;
    }
}
exports.replaceElement = replaceElement;
/**
 * Append a child to an element.
 *
 * @param elem The element to append to.
 * @param child The element to be added as a child.
 */ function appendChild(elem, child) {
    removeElement(child);
    child.next = null;
    child.parent = elem;
    if (elem.children.push(child) > 1) {
        var sibling = elem.children[elem.children.length - 2];
        sibling.next = child;
        child.prev = sibling;
    } else {
        child.prev = null;
    }
}
exports.appendChild = appendChild;
/**
 * Append an element after another.
 *
 * @param elem The element to append after.
 * @param next The element be added.
 */ function append(elem, next) {
    removeElement(next);
    var parent = elem.parent;
    var currNext = elem.next;
    next.next = currNext;
    next.prev = elem;
    elem.next = next;
    next.parent = parent;
    if (currNext) {
        currNext.prev = next;
        if (parent) {
            var childs = parent.children;
            childs.splice(childs.lastIndexOf(currNext), 0, next);
        }
    } else if (parent) {
        parent.children.push(next);
    }
}
exports.append = append;
/**
 * Prepend a child to an element.
 *
 * @param elem The element to prepend before.
 * @param child The element to be added as a child.
 */ function prependChild(elem, child) {
    removeElement(child);
    child.parent = elem;
    child.prev = null;
    if (elem.children.unshift(child) !== 1) {
        var sibling = elem.children[1];
        sibling.prev = child;
        child.next = sibling;
    } else {
        child.next = null;
    }
}
exports.prependChild = prependChild;
/**
 * Prepend an element before another.
 *
 * @param elem The element to prepend before.
 * @param prev The element be added.
 */ function prepend(elem, prev) {
    removeElement(prev);
    var parent = elem.parent;
    if (parent) {
        var childs = parent.children;
        childs.splice(childs.indexOf(elem), 0, prev);
    }
    if (elem.prev) {
        elem.prev.next = prev;
    }
    prev.parent = parent;
    prev.prev = elem.prev;
    prev.next = elem;
    elem.prev = prev;
}
exports.prepend = prepend;
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/querying.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.findAll = exports.existsOne = exports.findOne = exports.findOneChild = exports.find = exports.filter = void 0;
var domhandler_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domhandler/lib/index.js [app-route] (ecmascript)");
/**
 * Search a node and its children for nodes passing a test function.
 *
 * @param test Function to test nodes on.
 * @param node Node to search. Will be included in the result set if it matches.
 * @param recurse Also consider child nodes.
 * @param limit Maximum number of nodes to return.
 * @returns All nodes passing `test`.
 */ function filter(test, node, recurse, limit) {
    if (recurse === void 0) {
        recurse = true;
    }
    if (limit === void 0) {
        limit = Infinity;
    }
    if (!Array.isArray(node)) node = [
        node
    ];
    return find(test, node, recurse, limit);
}
exports.filter = filter;
/**
 * Search an array of node and its children for nodes passing a test function.
 *
 * @param test Function to test nodes on.
 * @param nodes Array of nodes to search.
 * @param recurse Also consider child nodes.
 * @param limit Maximum number of nodes to return.
 * @returns All nodes passing `test`.
 */ function find(test, nodes, recurse, limit) {
    var result = [];
    for(var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++){
        var elem = nodes_1[_i];
        if (test(elem)) {
            result.push(elem);
            if (--limit <= 0) break;
        }
        if (recurse && (0, domhandler_1.hasChildren)(elem) && elem.children.length > 0) {
            var children = find(test, elem.children, recurse, limit);
            result.push.apply(result, children);
            limit -= children.length;
            if (limit <= 0) break;
        }
    }
    return result;
}
exports.find = find;
/**
 * Finds the first element inside of an array that matches a test function.
 *
 * @param test Function to test nodes on.
 * @param nodes Array of nodes to search.
 * @returns The first node in the array that passes `test`.
 */ function findOneChild(test, nodes) {
    return nodes.find(test);
}
exports.findOneChild = findOneChild;
/**
 * Finds one element in a tree that passes a test.
 *
 * @param test Function to test nodes on.
 * @param nodes Array of nodes to search.
 * @param recurse Also consider child nodes.
 * @returns The first child node that passes `test`.
 */ function findOne(test, nodes, recurse) {
    if (recurse === void 0) {
        recurse = true;
    }
    var elem = null;
    for(var i = 0; i < nodes.length && !elem; i++){
        var checked = nodes[i];
        if (!(0, domhandler_1.isTag)(checked)) {
            continue;
        } else if (test(checked)) {
            elem = checked;
        } else if (recurse && checked.children.length > 0) {
            elem = findOne(test, checked.children);
        }
    }
    return elem;
}
exports.findOne = findOne;
/**
 * @param test Function to test nodes on.
 * @param nodes Array of nodes to search.
 * @returns Whether a tree of nodes contains at least one node passing a test.
 */ function existsOne(test, nodes) {
    return nodes.some(function(checked) {
        return (0, domhandler_1.isTag)(checked) && (test(checked) || checked.children.length > 0 && existsOne(test, checked.children));
    });
}
exports.existsOne = existsOne;
/**
 * Search and array of nodes and its children for nodes passing a test function.
 *
 * Same as `find`, only with less options, leading to reduced complexity.
 *
 * @param test Function to test nodes on.
 * @param nodes Array of nodes to search.
 * @returns All nodes passing `test`.
 */ function findAll(test, nodes) {
    var _a;
    var result = [];
    var stack = nodes.filter(domhandler_1.isTag);
    var elem;
    while(elem = stack.shift()){
        var children = (_a = elem.children) === null || _a === void 0 ? void 0 : _a.filter(domhandler_1.isTag);
        if (children && children.length > 0) {
            stack.unshift.apply(stack, children);
        }
        if (test(elem)) result.push(elem);
    }
    return result;
}
exports.findAll = findAll;
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/legacy.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getElementsByTagType = exports.getElementsByTagName = exports.getElementById = exports.getElements = exports.testElement = void 0;
var domhandler_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domhandler/lib/index.js [app-route] (ecmascript)");
var querying_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/querying.js [app-route] (ecmascript)");
var Checks = {
    tag_name: function(name) {
        if (typeof name === "function") {
            return function(elem) {
                return (0, domhandler_1.isTag)(elem) && name(elem.name);
            };
        } else if (name === "*") {
            return domhandler_1.isTag;
        }
        return function(elem) {
            return (0, domhandler_1.isTag)(elem) && elem.name === name;
        };
    },
    tag_type: function(type) {
        if (typeof type === "function") {
            return function(elem) {
                return type(elem.type);
            };
        }
        return function(elem) {
            return elem.type === type;
        };
    },
    tag_contains: function(data) {
        if (typeof data === "function") {
            return function(elem) {
                return (0, domhandler_1.isText)(elem) && data(elem.data);
            };
        }
        return function(elem) {
            return (0, domhandler_1.isText)(elem) && elem.data === data;
        };
    }
};
/**
 * @param attrib Attribute to check.
 * @param value Attribute value to look for.
 * @returns A function to check whether the a node has an attribute with a particular value.
 */ function getAttribCheck(attrib, value) {
    if (typeof value === "function") {
        return function(elem) {
            return (0, domhandler_1.isTag)(elem) && value(elem.attribs[attrib]);
        };
    }
    return function(elem) {
        return (0, domhandler_1.isTag)(elem) && elem.attribs[attrib] === value;
    };
}
/**
 * @param a First function to combine.
 * @param b Second function to combine.
 * @returns A function taking a node and returning `true` if either
 * of the input functions returns `true` for the node.
 */ function combineFuncs(a, b) {
    return function(elem) {
        return a(elem) || b(elem);
    };
}
/**
 * @param options An object describing nodes to look for.
 * @returns A function executing all checks in `options` and returning `true`
 * if any of them match a node.
 */ function compileTest(options) {
    var funcs = Object.keys(options).map(function(key) {
        var value = options[key];
        return Object.prototype.hasOwnProperty.call(Checks, key) ? Checks[key](value) : getAttribCheck(key, value);
    });
    return funcs.length === 0 ? null : funcs.reduce(combineFuncs);
}
/**
 * @param options An object describing nodes to look for.
 * @param node The element to test.
 * @returns Whether the element matches the description in `options`.
 */ function testElement(options, node) {
    var test = compileTest(options);
    return test ? test(node) : true;
}
exports.testElement = testElement;
/**
 * @param options An object describing nodes to look for.
 * @param nodes Nodes to search through.
 * @param recurse Also consider child nodes.
 * @param limit Maximum number of nodes to return.
 * @returns All nodes that match `options`.
 */ function getElements(options, nodes, recurse, limit) {
    if (limit === void 0) {
        limit = Infinity;
    }
    var test = compileTest(options);
    return test ? (0, querying_1.filter)(test, nodes, recurse, limit) : [];
}
exports.getElements = getElements;
/**
 * @param id The unique ID attribute value to look for.
 * @param nodes Nodes to search through.
 * @param recurse Also consider child nodes.
 * @returns The node with the supplied ID.
 */ function getElementById(id, nodes, recurse) {
    if (recurse === void 0) {
        recurse = true;
    }
    if (!Array.isArray(nodes)) nodes = [
        nodes
    ];
    return (0, querying_1.findOne)(getAttribCheck("id", id), nodes, recurse);
}
exports.getElementById = getElementById;
/**
 * @param tagName Tag name to search for.
 * @param nodes Nodes to search through.
 * @param recurse Also consider child nodes.
 * @param limit Maximum number of nodes to return.
 * @returns All nodes with the supplied `tagName`.
 */ function getElementsByTagName(tagName, nodes, recurse, limit) {
    if (recurse === void 0) {
        recurse = true;
    }
    if (limit === void 0) {
        limit = Infinity;
    }
    return (0, querying_1.filter)(Checks.tag_name(tagName), nodes, recurse, limit);
}
exports.getElementsByTagName = getElementsByTagName;
/**
 * @param type Element type to look for.
 * @param nodes Nodes to search through.
 * @param recurse Also consider child nodes.
 * @param limit Maximum number of nodes to return.
 * @returns All nodes with the supplied `type`.
 */ function getElementsByTagType(type, nodes, recurse, limit) {
    if (recurse === void 0) {
        recurse = true;
    }
    if (limit === void 0) {
        limit = Infinity;
    }
    return (0, querying_1.filter)(Checks.tag_type(type), nodes, recurse, limit);
}
exports.getElementsByTagType = getElementsByTagType;
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/helpers.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.uniqueSort = exports.compareDocumentPosition = exports.removeSubsets = void 0;
var domhandler_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domhandler/lib/index.js [app-route] (ecmascript)");
/**
 * Given an array of nodes, remove any member that is contained by another.
 *
 * @param nodes Nodes to filter.
 * @returns Remaining nodes that aren't subtrees of each other.
 */ function removeSubsets(nodes) {
    var idx = nodes.length;
    /*
     * Check if each node (or one of its ancestors) is already contained in the
     * array.
     */ while(--idx >= 0){
        var node = nodes[idx];
        /*
         * Remove the node if it is not unique.
         * We are going through the array from the end, so we only
         * have to check nodes that preceed the node under consideration in the array.
         */ if (idx > 0 && nodes.lastIndexOf(node, idx - 1) >= 0) {
            nodes.splice(idx, 1);
            continue;
        }
        for(var ancestor = node.parent; ancestor; ancestor = ancestor.parent){
            if (nodes.includes(ancestor)) {
                nodes.splice(idx, 1);
                break;
            }
        }
    }
    return nodes;
}
exports.removeSubsets = removeSubsets;
/**
 * Compare the position of one node against another node in any other document.
 * The return value is a bitmask with the following values:
 *
 * Document order:
 * > There is an ordering, document order, defined on all the nodes in the
 * > document corresponding to the order in which the first character of the
 * > XML representation of each node occurs in the XML representation of the
 * > document after expansion of general entities. Thus, the document element
 * > node will be the first node. Element nodes occur before their children.
 * > Thus, document order orders element nodes in order of the occurrence of
 * > their start-tag in the XML (after expansion of entities). The attribute
 * > nodes of an element occur after the element and before its children. The
 * > relative order of attribute nodes is implementation-dependent./
 *
 * Source:
 * http://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-document-order
 *
 * @param nodeA The first node to use in the comparison
 * @param nodeB The second node to use in the comparison
 * @returns A bitmask describing the input nodes' relative position.
 *
 * See http://dom.spec.whatwg.org/#dom-node-comparedocumentposition for
 * a description of these values.
 */ function compareDocumentPosition(nodeA, nodeB) {
    var aParents = [];
    var bParents = [];
    if (nodeA === nodeB) {
        return 0;
    }
    var current = (0, domhandler_1.hasChildren)(nodeA) ? nodeA : nodeA.parent;
    while(current){
        aParents.unshift(current);
        current = current.parent;
    }
    current = (0, domhandler_1.hasChildren)(nodeB) ? nodeB : nodeB.parent;
    while(current){
        bParents.unshift(current);
        current = current.parent;
    }
    var maxIdx = Math.min(aParents.length, bParents.length);
    var idx = 0;
    while(idx < maxIdx && aParents[idx] === bParents[idx]){
        idx++;
    }
    if (idx === 0) {
        return 1 /* DISCONNECTED */ ;
    }
    var sharedParent = aParents[idx - 1];
    var siblings = sharedParent.children;
    var aSibling = aParents[idx];
    var bSibling = bParents[idx];
    if (siblings.indexOf(aSibling) > siblings.indexOf(bSibling)) {
        if (sharedParent === nodeB) {
            return 4 /* FOLLOWING */  | 16 /* CONTAINED_BY */ ;
        }
        return 4 /* FOLLOWING */ ;
    }
    if (sharedParent === nodeA) {
        return 2 /* PRECEDING */  | 8 /* CONTAINS */ ;
    }
    return 2 /* PRECEDING */ ;
}
exports.compareDocumentPosition = compareDocumentPosition;
/**
 * Sort an array of nodes based on their relative position in the document and
 * remove any duplicate nodes. If the array contains nodes that do not belong
 * to the same document, sort order is unspecified.
 *
 * @param nodes Array of DOM nodes.
 * @returns Collection of unique nodes, sorted in document order.
 */ function uniqueSort(nodes) {
    nodes = nodes.filter(function(node, i, arr) {
        return !arr.includes(node, i + 1);
    });
    nodes.sort(function(a, b) {
        var relative = compareDocumentPosition(a, b);
        if (relative & 2 /* PRECEDING */ ) {
            return -1;
        } else if (relative & 4 /* FOLLOWING */ ) {
            return 1;
        }
        return 0;
    });
    return nodes;
}
exports.uniqueSort = uniqueSort;
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/feeds.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getFeed = void 0;
var stringify_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/stringify.js [app-route] (ecmascript)");
var legacy_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/legacy.js [app-route] (ecmascript)");
/**
 * Get the feed object from the root of a DOM tree.
 *
 * @param doc - The DOM to to extract the feed from.
 * @returns The feed.
 */ function getFeed(doc) {
    var feedRoot = getOneElement(isValidFeed, doc);
    return !feedRoot ? null : feedRoot.name === "feed" ? getAtomFeed(feedRoot) : getRssFeed(feedRoot);
}
exports.getFeed = getFeed;
/**
 * Parse an Atom feed.
 *
 * @param feedRoot The root of the feed.
 * @returns The parsed feed.
 */ function getAtomFeed(feedRoot) {
    var _a;
    var childs = feedRoot.children;
    var feed = {
        type: "atom",
        items: (0, legacy_1.getElementsByTagName)("entry", childs).map(function(item) {
            var _a;
            var children = item.children;
            var entry = {
                media: getMediaElements(children)
            };
            addConditionally(entry, "id", "id", children);
            addConditionally(entry, "title", "title", children);
            var href = (_a = getOneElement("link", children)) === null || _a === void 0 ? void 0 : _a.attribs.href;
            if (href) {
                entry.link = href;
            }
            var description = fetch("summary", children) || fetch("content", children);
            if (description) {
                entry.description = description;
            }
            var pubDate = fetch("updated", children);
            if (pubDate) {
                entry.pubDate = new Date(pubDate);
            }
            return entry;
        })
    };
    addConditionally(feed, "id", "id", childs);
    addConditionally(feed, "title", "title", childs);
    var href = (_a = getOneElement("link", childs)) === null || _a === void 0 ? void 0 : _a.attribs.href;
    if (href) {
        feed.link = href;
    }
    addConditionally(feed, "description", "subtitle", childs);
    var updated = fetch("updated", childs);
    if (updated) {
        feed.updated = new Date(updated);
    }
    addConditionally(feed, "author", "email", childs, true);
    return feed;
}
/**
 * Parse a RSS feed.
 *
 * @param feedRoot The root of the feed.
 * @returns The parsed feed.
 */ function getRssFeed(feedRoot) {
    var _a, _b;
    var childs = (_b = (_a = getOneElement("channel", feedRoot.children)) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : [];
    var feed = {
        type: feedRoot.name.substr(0, 3),
        id: "",
        items: (0, legacy_1.getElementsByTagName)("item", feedRoot.children).map(function(item) {
            var children = item.children;
            var entry = {
                media: getMediaElements(children)
            };
            addConditionally(entry, "id", "guid", children);
            addConditionally(entry, "title", "title", children);
            addConditionally(entry, "link", "link", children);
            addConditionally(entry, "description", "description", children);
            var pubDate = fetch("pubDate", children);
            if (pubDate) entry.pubDate = new Date(pubDate);
            return entry;
        })
    };
    addConditionally(feed, "title", "title", childs);
    addConditionally(feed, "link", "link", childs);
    addConditionally(feed, "description", "description", childs);
    var updated = fetch("lastBuildDate", childs);
    if (updated) {
        feed.updated = new Date(updated);
    }
    addConditionally(feed, "author", "managingEditor", childs, true);
    return feed;
}
var MEDIA_KEYS_STRING = [
    "url",
    "type",
    "lang"
];
var MEDIA_KEYS_INT = [
    "fileSize",
    "bitrate",
    "framerate",
    "samplingrate",
    "channels",
    "duration",
    "height",
    "width"
];
/**
 * Get all media elements of a feed item.
 *
 * @param where Nodes to search in.
 * @returns Media elements.
 */ function getMediaElements(where) {
    return (0, legacy_1.getElementsByTagName)("media:content", where).map(function(elem) {
        var attribs = elem.attribs;
        var media = {
            medium: attribs.medium,
            isDefault: !!attribs.isDefault
        };
        for(var _i = 0, MEDIA_KEYS_STRING_1 = MEDIA_KEYS_STRING; _i < MEDIA_KEYS_STRING_1.length; _i++){
            var attrib = MEDIA_KEYS_STRING_1[_i];
            if (attribs[attrib]) {
                media[attrib] = attribs[attrib];
            }
        }
        for(var _a = 0, MEDIA_KEYS_INT_1 = MEDIA_KEYS_INT; _a < MEDIA_KEYS_INT_1.length; _a++){
            var attrib = MEDIA_KEYS_INT_1[_a];
            if (attribs[attrib]) {
                media[attrib] = parseInt(attribs[attrib], 10);
            }
        }
        if (attribs.expression) {
            media.expression = attribs.expression;
        }
        return media;
    });
}
/**
 * Get one element by tag name.
 *
 * @param tagName Tag name to look for
 * @param node Node to search in
 * @returns The element or null
 */ function getOneElement(tagName, node) {
    return (0, legacy_1.getElementsByTagName)(tagName, node, true, 1)[0];
}
/**
 * Get the text content of an element with a certain tag name.
 *
 * @param tagName Tag name to look for.
 * @param where  Node to search in.
 * @param recurse Whether to recurse into child nodes.
 * @returns The text content of the element.
 */ function fetch(tagName, where, recurse) {
    if (recurse === void 0) {
        recurse = false;
    }
    return (0, stringify_1.textContent)((0, legacy_1.getElementsByTagName)(tagName, where, recurse, 1)).trim();
}
/**
 * Adds a property to an object if it has a value.
 *
 * @param obj Object to be extended
 * @param prop Property name
 * @param tagName Tag name that contains the conditionally added property
 * @param where Element to search for the property
 * @param recurse Whether to recurse into child nodes.
 */ function addConditionally(obj, prop, tagName, where, recurse) {
    if (recurse === void 0) {
        recurse = false;
    }
    var val = fetch(tagName, where, recurse);
    if (val) obj[prop] = val;
}
/**
 * Checks if an element is a feed root node.
 *
 * @param value The name of the element to check.
 * @returns Whether an element is a feed root node.
 */ function isValidFeed(value) {
    return value === "rss" || value === "feed" || value === "rdf:RDF";
}
}),
"[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasChildren = exports.isDocument = exports.isComment = exports.isText = exports.isCDATA = exports.isTag = void 0;
__exportStar(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/stringify.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/traversal.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/manipulation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/querying.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/legacy.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/helpers.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domutils/lib/feeds.js [app-route] (ecmascript)"), exports);
/** @deprecated Use these methods from `domhandler` directly. */ var domhandler_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/htmlparser2/node_modules/domhandler/lib/index.js [app-route] (ecmascript)");
Object.defineProperty(exports, "isTag", {
    enumerable: true,
    get: function() {
        return domhandler_1.isTag;
    }
});
Object.defineProperty(exports, "isCDATA", {
    enumerable: true,
    get: function() {
        return domhandler_1.isCDATA;
    }
});
Object.defineProperty(exports, "isText", {
    enumerable: true,
    get: function() {
        return domhandler_1.isText;
    }
});
Object.defineProperty(exports, "isComment", {
    enumerable: true,
    get: function() {
        return domhandler_1.isComment;
    }
});
Object.defineProperty(exports, "isDocument", {
    enumerable: true,
    get: function() {
        return domhandler_1.isDocument;
    }
});
Object.defineProperty(exports, "hasChildren", {
    enumerable: true,
    get: function() {
        return domhandler_1.hasChildren;
    }
});
}),
"[project]/node_modules/ts-custom-error/dist/custom-error.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CustomError",
    ()=>CustomError,
    "customErrorFactory",
    ()=>customErrorFactory
]);
function fixProto(target, prototype) {
    var setPrototypeOf = Object.setPrototypeOf;
    setPrototypeOf ? setPrototypeOf(target, prototype) : target.__proto__ = prototype;
}
function fixStack(target, fn) {
    if (fn === void 0) {
        fn = target.constructor;
    }
    var captureStackTrace = Error.captureStackTrace;
    captureStackTrace && captureStackTrace(target, fn);
}
var __extends = undefined && undefined.__extends || function() {
    var _extendStatics = function extendStatics(d, b) {
        _extendStatics = Object.setPrototypeOf || ({
            __proto__: []
        }) instanceof Array && function(d, b) {
            d.__proto__ = b;
        } || function(d, b) {
            for(var p in b){
                if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
            }
        };
        return _extendStatics(d, b);
    };
    return function(d, b) {
        if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        _extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
var CustomError = function(_super) {
    __extends(CustomError, _super);
    function CustomError(message, options) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message, options) || this;
        Object.defineProperty(_this, 'name', {
            value: _newTarget.name,
            enumerable: false,
            configurable: true
        });
        fixProto(_this, _newTarget.prototype);
        fixStack(_this);
        return _this;
    }
    return CustomError;
}(Error);
var __spreadArray = undefined && undefined.__spreadArray || function(to, from, pack) {
    if (pack || arguments.length === 2) for(var i = 0, l = from.length, ar; i < l; i++){
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function customErrorFactory(fn, parent) {
    if (parent === void 0) {
        parent = Error;
    }
    function CustomError() {
        var args = [];
        for(var _i = 0; _i < arguments.length; _i++){
            args[_i] = arguments[_i];
        }
        if (!(this instanceof CustomError)) return new (CustomError.bind.apply(CustomError, __spreadArray([
            void 0
        ], args, false)))();
        parent.apply(this, args);
        Object.defineProperty(this, 'name', {
            value: fn.name || parent.name,
            enumerable: false,
            configurable: true
        });
        fn.apply(this, args);
        fixStack(this, CustomError);
    }
    return Object.defineProperties(CustomError, {
        prototype: {
            value: Object.create(parent.prototype, {
                constructor: {
                    value: CustomError,
                    writable: true,
                    configurable: true
                }
            })
        }
    });
}
;
 //# sourceMappingURL=custom-error.mjs.map
}),
"[externals]/websocket [external] (websocket, cjs, [project]/node_modules/websocket)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("websocket-2ca8c4fe6fe146fa", () => require("websocket-2ca8c4fe6fe146fa"));

module.exports = mod;
}),
"[project]/node_modules/tslib/tslib.es6.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__addDisposableResource",
    ()=>__addDisposableResource,
    "__assign",
    ()=>__assign,
    "__asyncDelegator",
    ()=>__asyncDelegator,
    "__asyncGenerator",
    ()=>__asyncGenerator,
    "__asyncValues",
    ()=>__asyncValues,
    "__await",
    ()=>__await,
    "__awaiter",
    ()=>__awaiter,
    "__classPrivateFieldGet",
    ()=>__classPrivateFieldGet,
    "__classPrivateFieldIn",
    ()=>__classPrivateFieldIn,
    "__classPrivateFieldSet",
    ()=>__classPrivateFieldSet,
    "__createBinding",
    ()=>__createBinding,
    "__decorate",
    ()=>__decorate,
    "__disposeResources",
    ()=>__disposeResources,
    "__esDecorate",
    ()=>__esDecorate,
    "__exportStar",
    ()=>__exportStar,
    "__extends",
    ()=>__extends,
    "__generator",
    ()=>__generator,
    "__importDefault",
    ()=>__importDefault,
    "__importStar",
    ()=>__importStar,
    "__makeTemplateObject",
    ()=>__makeTemplateObject,
    "__metadata",
    ()=>__metadata,
    "__param",
    ()=>__param,
    "__propKey",
    ()=>__propKey,
    "__read",
    ()=>__read,
    "__rest",
    ()=>__rest,
    "__rewriteRelativeImportExtension",
    ()=>__rewriteRelativeImportExtension,
    "__runInitializers",
    ()=>__runInitializers,
    "__setFunctionName",
    ()=>__setFunctionName,
    "__spread",
    ()=>__spread,
    "__spreadArray",
    ()=>__spreadArray,
    "__spreadArrays",
    ()=>__spreadArrays,
    "__values",
    ()=>__values,
    "default",
    ()=>__TURBOPACK__default__export__
]);
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol, Iterator */ var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || ({
        __proto__: []
    }) instanceof Array && function(d, b) {
        d.__proto__ = b;
    } || function(d, b) {
        for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return extendStatics(d, b);
};
function __extends(d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function __rest(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
}
function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
        if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
        return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for(var i = decorators.length - 1; i >= 0; i--){
        var context = {};
        for(var p in contextIn)context[p] = p === "access" ? {} : contextIn[p];
        for(var p in contextIn.access)context.access[p] = contextIn.access[p];
        context.addInitializer = function(f) {
            if (done) throw new TypeError("Cannot add initializers after decoration has completed");
            extraInitializers.push(accept(f || null));
        };
        var result = (0, decorators[i])(kind === "accessor" ? {
            get: descriptor.get,
            set: descriptor.set
        } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        } else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}
;
function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for(var i = 0; i < initializers.length; i++){
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
}
;
function __propKey(x) {
    return typeof x === "symbol" ? x : "".concat(x);
}
;
function __setFunctionName(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", {
        configurable: true,
        value: prefix ? "".concat(prefix, " ", name) : name
    });
}
;
function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function __generator(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    //TURBOPACK unreachable
    ;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var __createBinding = Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
};
function __exportStar(m, o) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}
function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
}
function __spread() {
    for(var ar = [], i = 0; i < arguments.length; i++)ar = ar.concat(__read(arguments[i]));
    return ar;
}
function __spreadArrays() {
    for(var s = 0, i = 0, il = arguments.length; i < il; i++)s += arguments[i].length;
    for(var r = Array(s), k = 0, i = 0; i < il; i++)for(var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)r[k] = a[j];
    return r;
}
function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for(var i = 0, l = from.length, ar; i < l; i++){
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}
function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
        return this;
    }, i;
    //TURBOPACK unreachable
    ;
    function awaitReturn(f) {
        return function(v) {
            return Promise.resolve(v).then(f, reject);
        };
    }
    function verb(n, f) {
        if (g[n]) {
            i[n] = function(v) {
                return new Promise(function(a, b) {
                    q.push([
                        n,
                        v,
                        a,
                        b
                    ]) > 1 || resume(n, v);
                });
            };
            if (f) i[n] = f(i[n]);
        }
    }
    function resume(n, v) {
        try {
            step(g[n](v));
        } catch (e) {
            settle(q[0][3], e);
        }
    }
    function step(r) {
        r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
        resume("next", value);
    }
    function reject(value) {
        resume("throw", value);
    }
    function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
    }
}
function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function(e) {
        throw e;
    }), verb("return"), i[Symbol.iterator] = function() {
        return this;
    }, i;
    //TURBOPACK unreachable
    ;
    function verb(n, f) {
        i[n] = o[n] ? function(v) {
            return (p = !p) ? {
                value: __await(o[n](v)),
                done: false
            } : f ? f(v) : v;
        } : f;
    }
}
function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i);
    //TURBOPACK unreachable
    ;
    function verb(n) {
        i[n] = o[n] && function(v) {
            return new Promise(function(resolve, reject) {
                v = o[n](v), settle(resolve, reject, v.done, v.value);
            });
        };
    }
    function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v) {
            resolve({
                value: v,
                done: d
            });
        }, reject);
    }
}
function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) {
        Object.defineProperty(cooked, "raw", {
            value: raw
        });
    } else {
        cooked.raw = raw;
    }
    return cooked;
}
;
var __setModuleDefault = Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
};
var ownKeys = function(o) {
    ownKeys = Object.getOwnPropertyNames || function(o) {
        var ar = [];
        for(var k in o)if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
        return ar;
    };
    return ownKeys(o);
};
function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k = ownKeys(mod), i = 0; i < k.length; i++)if (k[i] !== "default") __createBinding(result, mod, k[i]);
    }
    __setModuleDefault(result, mod);
    return result;
}
function __importDefault(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
}
function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function __classPrivateFieldIn(state, receiver) {
    if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
}
function __addDisposableResource(env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() {
            try {
                inner.call(this);
            } catch (e) {
                return Promise.reject(e);
            }
        };
        env.stack.push({
            value: value,
            dispose: dispose,
            async: async
        });
    } else if (async) {
        env.stack.push({
            async: true
        });
    }
    return value;
}
var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function __disposeResources(env) {
    function fail(e) {
        env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
    }
    var r, s = 0;
    function next() {
        while(r = env.stack.pop()){
            try {
                if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                if (r.dispose) {
                    var result = r.dispose.call(r.value);
                    if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
                        fail(e);
                        return next();
                    });
                } else s |= 1;
            } catch (e) {
                fail(e);
            }
        }
        if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
        if (env.hasError) throw env.error;
    }
    return next();
}
function __rewriteRelativeImportExtension(path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
        });
    }
    return path;
}
const __TURBOPACK__default__export__ = {
    __extends,
    __assign,
    __rest,
    __decorate,
    __param,
    __esDecorate,
    __runInitializers,
    __propKey,
    __setFunctionName,
    __metadata,
    __awaiter,
    __generator,
    __createBinding,
    __exportStar,
    __values,
    __read,
    __spread,
    __spreadArrays,
    __spreadArray,
    __await,
    __asyncGenerator,
    __asyncDelegator,
    __asyncValues,
    __makeTemplateObject,
    __importStar,
    __importDefault,
    __classPrivateFieldGet,
    __classPrivateFieldSet,
    __classPrivateFieldIn,
    __addDisposableResource,
    __disposeResources,
    __rewriteRelativeImportExtension
};
}),
"[project]/node_modules/telegram/node_modules/async-mutex/lib/errors.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.E_CANCELED = exports.E_ALREADY_LOCKED = exports.E_TIMEOUT = void 0;
exports.E_TIMEOUT = new Error('timeout while waiting for mutex to become available');
exports.E_ALREADY_LOCKED = new Error('mutex already locked');
exports.E_CANCELED = new Error('request for lock canceled');
}),
"[project]/node_modules/telegram/node_modules/async-mutex/lib/Semaphore.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = __turbopack_context__.r("[project]/node_modules/tslib/tslib.es6.mjs [app-route] (ecmascript)");
var errors_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/async-mutex/lib/errors.js [app-route] (ecmascript)");
var Semaphore = function() {
    function Semaphore(_maxConcurrency, _cancelError) {
        if (_cancelError === void 0) {
            _cancelError = errors_1.E_CANCELED;
        }
        this._maxConcurrency = _maxConcurrency;
        this._cancelError = _cancelError;
        this._queue = [];
        this._waiters = [];
        if (_maxConcurrency <= 0) {
            throw new Error('semaphore must be initialized to a positive value');
        }
        this._value = _maxConcurrency;
    }
    Semaphore.prototype.acquire = function() {
        var _this = this;
        var locked = this.isLocked();
        var ticketPromise = new Promise(function(resolve, reject) {
            return _this._queue.push({
                resolve: resolve,
                reject: reject
            });
        });
        if (!locked) this._dispatch();
        return ticketPromise;
    };
    Semaphore.prototype.runExclusive = function(callback) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function() {
            var _a, value, release;
            return (0, tslib_1.__generator)(this, function(_b) {
                switch(_b.label){
                    case 0:
                        return [
                            4 /*yield*/ ,
                            this.acquire()
                        ];
                    case 1:
                        _a = _b.sent(), value = _a[0], release = _a[1];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([
                            2,
                            ,
                            4,
                            5
                        ]);
                        return [
                            4 /*yield*/ ,
                            callback(value)
                        ];
                    case 3:
                        return [
                            2 /*return*/ ,
                            _b.sent()
                        ];
                    case 4:
                        release();
                        return [
                            7 /*endfinally*/ 
                        ];
                    case 5:
                        return [
                            2 /*return*/ 
                        ];
                }
            });
        });
    };
    Semaphore.prototype.waitForUnlock = function() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function() {
            var waitPromise;
            var _this = this;
            return (0, tslib_1.__generator)(this, function(_a) {
                if (!this.isLocked()) {
                    return [
                        2 /*return*/ ,
                        Promise.resolve()
                    ];
                }
                waitPromise = new Promise(function(resolve) {
                    return _this._waiters.push({
                        resolve: resolve
                    });
                });
                return [
                    2 /*return*/ ,
                    waitPromise
                ];
            });
        });
    };
    Semaphore.prototype.isLocked = function() {
        return this._value <= 0;
    };
    /** @deprecated Deprecated in 0.3.0, will be removed in 0.4.0. Use runExclusive instead. */ Semaphore.prototype.release = function() {
        if (this._maxConcurrency > 1) {
            throw new Error('this method is unavailable on semaphores with concurrency > 1; use the scoped release returned by acquire instead');
        }
        if (this._currentReleaser) {
            var releaser = this._currentReleaser;
            this._currentReleaser = undefined;
            releaser();
        }
    };
    Semaphore.prototype.cancel = function() {
        var _this = this;
        this._queue.forEach(function(ticket) {
            return ticket.reject(_this._cancelError);
        });
        this._queue = [];
    };
    Semaphore.prototype._dispatch = function() {
        var _this = this;
        var nextTicket = this._queue.shift();
        if (!nextTicket) return;
        var released = false;
        this._currentReleaser = function() {
            if (released) return;
            released = true;
            _this._value++;
            _this._resolveWaiters();
            _this._dispatch();
        };
        nextTicket.resolve([
            this._value--,
            this._currentReleaser
        ]);
    };
    Semaphore.prototype._resolveWaiters = function() {
        this._waiters.forEach(function(waiter) {
            return waiter.resolve();
        });
        this._waiters = [];
    };
    return Semaphore;
}();
exports.default = Semaphore;
}),
"[project]/node_modules/telegram/node_modules/async-mutex/lib/Mutex.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var tslib_1 = __turbopack_context__.r("[project]/node_modules/tslib/tslib.es6.mjs [app-route] (ecmascript)");
var Semaphore_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/async-mutex/lib/Semaphore.js [app-route] (ecmascript)");
var Mutex = function() {
    function Mutex(cancelError) {
        this._semaphore = new Semaphore_1.default(1, cancelError);
    }
    Mutex.prototype.acquire = function() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function() {
            var _a, releaser;
            return (0, tslib_1.__generator)(this, function(_b) {
                switch(_b.label){
                    case 0:
                        return [
                            4 /*yield*/ ,
                            this._semaphore.acquire()
                        ];
                    case 1:
                        _a = _b.sent(), releaser = _a[1];
                        return [
                            2 /*return*/ ,
                            releaser
                        ];
                }
            });
        });
    };
    Mutex.prototype.runExclusive = function(callback) {
        return this._semaphore.runExclusive(function() {
            return callback();
        });
    };
    Mutex.prototype.isLocked = function() {
        return this._semaphore.isLocked();
    };
    Mutex.prototype.waitForUnlock = function() {
        return this._semaphore.waitForUnlock();
    };
    /** @deprecated Deprecated in 0.3.0, will be removed in 0.4.0. Use runExclusive instead. */ Mutex.prototype.release = function() {
        this._semaphore.release();
    };
    Mutex.prototype.cancel = function() {
        return this._semaphore.cancel();
    };
    return Mutex;
}();
exports.default = Mutex;
}),
"[project]/node_modules/telegram/node_modules/async-mutex/lib/withTimeout.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.withTimeout = void 0;
var tslib_1 = __turbopack_context__.r("[project]/node_modules/tslib/tslib.es6.mjs [app-route] (ecmascript)");
var errors_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/async-mutex/lib/errors.js [app-route] (ecmascript)");
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function withTimeout(sync, timeout, timeoutError) {
    var _this = this;
    if (timeoutError === void 0) {
        timeoutError = errors_1.E_TIMEOUT;
    }
    return {
        acquire: function() {
            return new Promise(function(resolve, reject) {
                return (0, tslib_1.__awaiter)(_this, void 0, void 0, function() {
                    var isTimeout, handle, ticket, release, e_1;
                    return (0, tslib_1.__generator)(this, function(_a) {
                        switch(_a.label){
                            case 0:
                                isTimeout = false;
                                handle = setTimeout(function() {
                                    isTimeout = true;
                                    reject(timeoutError);
                                }, timeout);
                                _a.label = 1;
                            case 1:
                                _a.trys.push([
                                    1,
                                    3,
                                    ,
                                    4
                                ]);
                                return [
                                    4 /*yield*/ ,
                                    sync.acquire()
                                ];
                            case 2:
                                ticket = _a.sent();
                                if (isTimeout) {
                                    release = Array.isArray(ticket) ? ticket[1] : ticket;
                                    release();
                                } else {
                                    clearTimeout(handle);
                                    resolve(ticket);
                                }
                                return [
                                    3 /*break*/ ,
                                    4
                                ];
                            case 3:
                                e_1 = _a.sent();
                                if (!isTimeout) {
                                    clearTimeout(handle);
                                    reject(e_1);
                                }
                                return [
                                    3 /*break*/ ,
                                    4
                                ];
                            case 4:
                                return [
                                    2 /*return*/ 
                                ];
                        }
                    });
                });
            });
        },
        runExclusive: function(callback) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function() {
                var release, ticket;
                return (0, tslib_1.__generator)(this, function(_a) {
                    switch(_a.label){
                        case 0:
                            release = function() {
                                return undefined;
                            };
                            _a.label = 1;
                        case 1:
                            _a.trys.push([
                                1,
                                ,
                                7,
                                8
                            ]);
                            return [
                                4 /*yield*/ ,
                                this.acquire()
                            ];
                        case 2:
                            ticket = _a.sent();
                            if (!Array.isArray(ticket)) return [
                                3 /*break*/ ,
                                4
                            ];
                            release = ticket[1];
                            return [
                                4 /*yield*/ ,
                                callback(ticket[0])
                            ];
                        case 3:
                            return [
                                2 /*return*/ ,
                                _a.sent()
                            ];
                        case 4:
                            release = ticket;
                            return [
                                4 /*yield*/ ,
                                callback()
                            ];
                        case 5:
                            return [
                                2 /*return*/ ,
                                _a.sent()
                            ];
                        case 6:
                            return [
                                3 /*break*/ ,
                                8
                            ];
                        case 7:
                            release();
                            return [
                                7 /*endfinally*/ 
                            ];
                        case 8:
                            return [
                                2 /*return*/ 
                            ];
                    }
                });
            });
        },
        /** @deprecated Deprecated in 0.3.0, will be removed in 0.4.0. Use runExclusive instead. */ release: function() {
            sync.release();
        },
        cancel: function() {
            return sync.cancel();
        },
        waitForUnlock: function() {
            return sync.waitForUnlock();
        },
        isLocked: function() {
            return sync.isLocked();
        }
    };
}
exports.withTimeout = withTimeout;
}),
"[project]/node_modules/telegram/node_modules/async-mutex/lib/tryAcquire.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.tryAcquire = void 0;
var errors_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/async-mutex/lib/errors.js [app-route] (ecmascript)");
var withTimeout_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/async-mutex/lib/withTimeout.js [app-route] (ecmascript)");
// eslint-disable-next-lisne @typescript-eslint/explicit-module-boundary-types
function tryAcquire(sync, alreadyAcquiredError) {
    if (alreadyAcquiredError === void 0) {
        alreadyAcquiredError = errors_1.E_ALREADY_LOCKED;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (0, withTimeout_1.withTimeout)(sync, 0, alreadyAcquiredError);
}
exports.tryAcquire = tryAcquire;
}),
"[project]/node_modules/telegram/node_modules/async-mutex/lib/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.tryAcquire = exports.withTimeout = exports.Semaphore = exports.Mutex = void 0;
var tslib_1 = __turbopack_context__.r("[project]/node_modules/tslib/tslib.es6.mjs [app-route] (ecmascript)");
var Mutex_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/async-mutex/lib/Mutex.js [app-route] (ecmascript)");
Object.defineProperty(exports, "Mutex", {
    enumerable: true,
    get: function() {
        return Mutex_1.default;
    }
});
var Semaphore_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/async-mutex/lib/Semaphore.js [app-route] (ecmascript)");
Object.defineProperty(exports, "Semaphore", {
    enumerable: true,
    get: function() {
        return Semaphore_1.default;
    }
});
var withTimeout_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/async-mutex/lib/withTimeout.js [app-route] (ecmascript)");
Object.defineProperty(exports, "withTimeout", {
    enumerable: true,
    get: function() {
        return withTimeout_1.withTimeout;
    }
});
var tryAcquire_1 = __turbopack_context__.r("[project]/node_modules/telegram/node_modules/async-mutex/lib/tryAcquire.js [app-route] (ecmascript)");
Object.defineProperty(exports, "tryAcquire", {
    enumerable: true,
    get: function() {
        return tryAcquire_1.tryAcquire;
    }
});
(0, tslib_1.__exportStar)(__turbopack_context__.r("[project]/node_modules/telegram/node_modules/async-mutex/lib/errors.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/smart-buffer/build/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const buffer_1 = __turbopack_context__.r("[externals]/buffer [external] (buffer, cjs)");
/**
 * Error strings
 */ const ERRORS = {
    INVALID_ENCODING: 'Invalid encoding provided. Please specify a valid encoding the internal Node.js Buffer supports.',
    INVALID_SMARTBUFFER_SIZE: 'Invalid size provided. Size must be a valid integer greater than zero.',
    INVALID_SMARTBUFFER_BUFFER: 'Invalid Buffer provided in SmartBufferOptions.',
    INVALID_SMARTBUFFER_OBJECT: 'Invalid SmartBufferOptions object supplied to SmartBuffer constructor or factory methods.',
    INVALID_OFFSET: 'An invalid offset value was provided.',
    INVALID_OFFSET_NON_NUMBER: 'An invalid offset value was provided. A numeric value is required.',
    INVALID_LENGTH: 'An invalid length value was provided.',
    INVALID_LENGTH_NON_NUMBER: 'An invalid length value was provived. A numeric value is required.',
    INVALID_TARGET_OFFSET: 'Target offset is beyond the bounds of the internal SmartBuffer data.',
    INVALID_TARGET_LENGTH: 'Specified length value moves cursor beyong the bounds of the internal SmartBuffer data.',
    INVALID_READ_BEYOND_BOUNDS: 'Attempted to read beyond the bounds of the managed data.',
    INVALID_WRITE_BEYOND_BOUNDS: 'Attempted to write beyond the bounds of the managed data.'
};
exports.ERRORS = ERRORS;
/**
 * Checks if a given encoding is a valid Buffer encoding. (Throws an exception if check fails)
 *
 * @param { String } encoding The encoding string to check.
 */ function checkEncoding(encoding) {
    if (!buffer_1.Buffer.isEncoding(encoding)) {
        throw new Error(ERRORS.INVALID_ENCODING);
    }
}
exports.checkEncoding = checkEncoding;
/**
 * Checks if a given number is a finite integer. (Throws an exception if check fails)
 *
 * @param { Number } value The number value to check.
 */ function isFiniteInteger(value) {
    return typeof value === 'number' && isFinite(value) && isInteger(value);
}
exports.isFiniteInteger = isFiniteInteger;
/**
 * Checks if an offset/length value is valid. (Throws an exception if check fails)
 *
 * @param value The value to check.
 * @param offset True if checking an offset, false if checking a length.
 */ function checkOffsetOrLengthValue(value, offset) {
    if (typeof value === 'number') {
        // Check for non finite/non integers
        if (!isFiniteInteger(value) || value < 0) {
            throw new Error(offset ? ERRORS.INVALID_OFFSET : ERRORS.INVALID_LENGTH);
        }
    } else {
        throw new Error(offset ? ERRORS.INVALID_OFFSET_NON_NUMBER : ERRORS.INVALID_LENGTH_NON_NUMBER);
    }
}
/**
 * Checks if a length value is valid. (Throws an exception if check fails)
 *
 * @param { Number } length The value to check.
 */ function checkLengthValue(length) {
    checkOffsetOrLengthValue(length, false);
}
exports.checkLengthValue = checkLengthValue;
/**
 * Checks if a offset value is valid. (Throws an exception if check fails)
 *
 * @param { Number } offset The value to check.
 */ function checkOffsetValue(offset) {
    checkOffsetOrLengthValue(offset, true);
}
exports.checkOffsetValue = checkOffsetValue;
/**
 * Checks if a target offset value is out of bounds. (Throws an exception if check fails)
 *
 * @param { Number } offset The offset value to check.
 * @param { SmartBuffer } buff The SmartBuffer instance to check against.
 */ function checkTargetOffset(offset, buff) {
    if (offset < 0 || offset > buff.length) {
        throw new Error(ERRORS.INVALID_TARGET_OFFSET);
    }
}
exports.checkTargetOffset = checkTargetOffset;
/**
 * Determines whether a given number is a integer.
 * @param value The number to check.
 */ function isInteger(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}
/**
 * Throws if Node.js version is too low to support bigint
 */ function bigIntAndBufferInt64Check(bufferMethod) {
    if (typeof BigInt === 'undefined') {
        throw new Error('Platform does not support JS BigInt type.');
    }
    if (typeof buffer_1.Buffer.prototype[bufferMethod] === 'undefined') {
        throw new Error(`Platform does not support Buffer.prototype.${bufferMethod}.`);
    }
}
exports.bigIntAndBufferInt64Check = bigIntAndBufferInt64Check; //# sourceMappingURL=utils.js.map
}),
"[project]/node_modules/smart-buffer/build/smartbuffer.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const utils_1 = __turbopack_context__.r("[project]/node_modules/smart-buffer/build/utils.js [app-route] (ecmascript)");
// The default Buffer size if one is not provided.
const DEFAULT_SMARTBUFFER_SIZE = 4096;
// The default string encoding to use for reading/writing strings.
const DEFAULT_SMARTBUFFER_ENCODING = 'utf8';
class SmartBuffer {
    /**
     * Creates a new SmartBuffer instance.
     *
     * @param options { SmartBufferOptions } The SmartBufferOptions to apply to this instance.
     */ constructor(options){
        this.length = 0;
        this._encoding = DEFAULT_SMARTBUFFER_ENCODING;
        this._writeOffset = 0;
        this._readOffset = 0;
        if (SmartBuffer.isSmartBufferOptions(options)) {
            // Checks for encoding
            if (options.encoding) {
                utils_1.checkEncoding(options.encoding);
                this._encoding = options.encoding;
            }
            // Checks for initial size length
            if (options.size) {
                if (utils_1.isFiniteInteger(options.size) && options.size > 0) {
                    this._buff = Buffer.allocUnsafe(options.size);
                } else {
                    throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_SIZE);
                }
            // Check for initial Buffer
            } else if (options.buff) {
                if (Buffer.isBuffer(options.buff)) {
                    this._buff = options.buff;
                    this.length = options.buff.length;
                } else {
                    throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_BUFFER);
                }
            } else {
                this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
            }
        } else {
            // If something was passed but it's not a SmartBufferOptions object
            if (typeof options !== 'undefined') {
                throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_OBJECT);
            }
            // Otherwise default to sane options
            this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
        }
    }
    /**
     * Creates a new SmartBuffer instance with the provided internal Buffer size and optional encoding.
     *
     * @param size { Number } The size of the internal Buffer.
     * @param encoding { String } The BufferEncoding to use for strings.
     *
     * @return { SmartBuffer }
     */ static fromSize(size, encoding) {
        return new this({
            size: size,
            encoding: encoding
        });
    }
    /**
     * Creates a new SmartBuffer instance with the provided Buffer and optional encoding.
     *
     * @param buffer { Buffer } The Buffer to use as the internal Buffer value.
     * @param encoding { String } The BufferEncoding to use for strings.
     *
     * @return { SmartBuffer }
     */ static fromBuffer(buff, encoding) {
        return new this({
            buff: buff,
            encoding: encoding
        });
    }
    /**
     * Creates a new SmartBuffer instance with the provided SmartBufferOptions options.
     *
     * @param options { SmartBufferOptions } The options to use when creating the SmartBuffer instance.
     */ static fromOptions(options) {
        return new this(options);
    }
    /**
     * Type checking function that determines if an object is a SmartBufferOptions object.
     */ static isSmartBufferOptions(options) {
        const castOptions = options;
        return castOptions && (castOptions.encoding !== undefined || castOptions.size !== undefined || castOptions.buff !== undefined);
    }
    // Signed integers
    /**
     * Reads an Int8 value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readInt8(offset) {
        return this._readNumberValue(Buffer.prototype.readInt8, 1, offset);
    }
    /**
     * Reads an Int16BE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readInt16BE(offset) {
        return this._readNumberValue(Buffer.prototype.readInt16BE, 2, offset);
    }
    /**
     * Reads an Int16LE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readInt16LE(offset) {
        return this._readNumberValue(Buffer.prototype.readInt16LE, 2, offset);
    }
    /**
     * Reads an Int32BE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readInt32BE(offset) {
        return this._readNumberValue(Buffer.prototype.readInt32BE, 4, offset);
    }
    /**
     * Reads an Int32LE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readInt32LE(offset) {
        return this._readNumberValue(Buffer.prototype.readInt32LE, 4, offset);
    }
    /**
     * Reads a BigInt64BE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { BigInt }
     */ readBigInt64BE(offset) {
        utils_1.bigIntAndBufferInt64Check('readBigInt64BE');
        return this._readNumberValue(Buffer.prototype.readBigInt64BE, 8, offset);
    }
    /**
     * Reads a BigInt64LE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { BigInt }
     */ readBigInt64LE(offset) {
        utils_1.bigIntAndBufferInt64Check('readBigInt64LE');
        return this._readNumberValue(Buffer.prototype.readBigInt64LE, 8, offset);
    }
    /**
     * Writes an Int8 value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeInt8(value, offset) {
        this._writeNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
        return this;
    }
    /**
     * Inserts an Int8 value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertInt8(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
    }
    /**
     * Writes an Int16BE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeInt16BE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeInt16BE, 2, value, offset);
    }
    /**
     * Inserts an Int16BE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertInt16BE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeInt16BE, 2, value, offset);
    }
    /**
     * Writes an Int16LE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeInt16LE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeInt16LE, 2, value, offset);
    }
    /**
     * Inserts an Int16LE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertInt16LE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeInt16LE, 2, value, offset);
    }
    /**
     * Writes an Int32BE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeInt32BE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeInt32BE, 4, value, offset);
    }
    /**
     * Inserts an Int32BE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertInt32BE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeInt32BE, 4, value, offset);
    }
    /**
     * Writes an Int32LE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeInt32LE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeInt32LE, 4, value, offset);
    }
    /**
     * Inserts an Int32LE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertInt32LE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeInt32LE, 4, value, offset);
    }
    /**
     * Writes a BigInt64BE value to the current write position (or at optional offset).
     *
     * @param value { BigInt } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeBigInt64BE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigInt64BE');
        return this._writeNumberValue(Buffer.prototype.writeBigInt64BE, 8, value, offset);
    }
    /**
     * Inserts a BigInt64BE value at the given offset value.
     *
     * @param value { BigInt } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertBigInt64BE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigInt64BE');
        return this._insertNumberValue(Buffer.prototype.writeBigInt64BE, 8, value, offset);
    }
    /**
     * Writes a BigInt64LE value to the current write position (or at optional offset).
     *
     * @param value { BigInt } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeBigInt64LE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigInt64LE');
        return this._writeNumberValue(Buffer.prototype.writeBigInt64LE, 8, value, offset);
    }
    /**
     * Inserts a Int64LE value at the given offset value.
     *
     * @param value { BigInt } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertBigInt64LE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigInt64LE');
        return this._insertNumberValue(Buffer.prototype.writeBigInt64LE, 8, value, offset);
    }
    // Unsigned Integers
    /**
     * Reads an UInt8 value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readUInt8(offset) {
        return this._readNumberValue(Buffer.prototype.readUInt8, 1, offset);
    }
    /**
     * Reads an UInt16BE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readUInt16BE(offset) {
        return this._readNumberValue(Buffer.prototype.readUInt16BE, 2, offset);
    }
    /**
     * Reads an UInt16LE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readUInt16LE(offset) {
        return this._readNumberValue(Buffer.prototype.readUInt16LE, 2, offset);
    }
    /**
     * Reads an UInt32BE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readUInt32BE(offset) {
        return this._readNumberValue(Buffer.prototype.readUInt32BE, 4, offset);
    }
    /**
     * Reads an UInt32LE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readUInt32LE(offset) {
        return this._readNumberValue(Buffer.prototype.readUInt32LE, 4, offset);
    }
    /**
     * Reads a BigUInt64BE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { BigInt }
     */ readBigUInt64BE(offset) {
        utils_1.bigIntAndBufferInt64Check('readBigUInt64BE');
        return this._readNumberValue(Buffer.prototype.readBigUInt64BE, 8, offset);
    }
    /**
     * Reads a BigUInt64LE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { BigInt }
     */ readBigUInt64LE(offset) {
        utils_1.bigIntAndBufferInt64Check('readBigUInt64LE');
        return this._readNumberValue(Buffer.prototype.readBigUInt64LE, 8, offset);
    }
    /**
     * Writes an UInt8 value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeUInt8(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeUInt8, 1, value, offset);
    }
    /**
     * Inserts an UInt8 value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertUInt8(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeUInt8, 1, value, offset);
    }
    /**
     * Writes an UInt16BE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeUInt16BE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeUInt16BE, 2, value, offset);
    }
    /**
     * Inserts an UInt16BE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertUInt16BE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeUInt16BE, 2, value, offset);
    }
    /**
     * Writes an UInt16LE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeUInt16LE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeUInt16LE, 2, value, offset);
    }
    /**
     * Inserts an UInt16LE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertUInt16LE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeUInt16LE, 2, value, offset);
    }
    /**
     * Writes an UInt32BE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeUInt32BE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeUInt32BE, 4, value, offset);
    }
    /**
     * Inserts an UInt32BE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertUInt32BE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeUInt32BE, 4, value, offset);
    }
    /**
     * Writes an UInt32LE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeUInt32LE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeUInt32LE, 4, value, offset);
    }
    /**
     * Inserts an UInt32LE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertUInt32LE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeUInt32LE, 4, value, offset);
    }
    /**
     * Writes a BigUInt64BE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeBigUInt64BE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigUInt64BE');
        return this._writeNumberValue(Buffer.prototype.writeBigUInt64BE, 8, value, offset);
    }
    /**
     * Inserts a BigUInt64BE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertBigUInt64BE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigUInt64BE');
        return this._insertNumberValue(Buffer.prototype.writeBigUInt64BE, 8, value, offset);
    }
    /**
     * Writes a BigUInt64LE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeBigUInt64LE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigUInt64LE');
        return this._writeNumberValue(Buffer.prototype.writeBigUInt64LE, 8, value, offset);
    }
    /**
     * Inserts a BigUInt64LE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertBigUInt64LE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigUInt64LE');
        return this._insertNumberValue(Buffer.prototype.writeBigUInt64LE, 8, value, offset);
    }
    // Floating Point
    /**
     * Reads an FloatBE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readFloatBE(offset) {
        return this._readNumberValue(Buffer.prototype.readFloatBE, 4, offset);
    }
    /**
     * Reads an FloatLE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readFloatLE(offset) {
        return this._readNumberValue(Buffer.prototype.readFloatLE, 4, offset);
    }
    /**
     * Writes a FloatBE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeFloatBE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeFloatBE, 4, value, offset);
    }
    /**
     * Inserts a FloatBE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertFloatBE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeFloatBE, 4, value, offset);
    }
    /**
     * Writes a FloatLE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeFloatLE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeFloatLE, 4, value, offset);
    }
    /**
     * Inserts a FloatLE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertFloatLE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeFloatLE, 4, value, offset);
    }
    // Double Floating Point
    /**
     * Reads an DoublEBE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readDoubleBE(offset) {
        return this._readNumberValue(Buffer.prototype.readDoubleBE, 8, offset);
    }
    /**
     * Reads an DoubleLE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readDoubleLE(offset) {
        return this._readNumberValue(Buffer.prototype.readDoubleLE, 8, offset);
    }
    /**
     * Writes a DoubleBE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeDoubleBE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeDoubleBE, 8, value, offset);
    }
    /**
     * Inserts a DoubleBE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertDoubleBE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeDoubleBE, 8, value, offset);
    }
    /**
     * Writes a DoubleLE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeDoubleLE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeDoubleLE, 8, value, offset);
    }
    /**
     * Inserts a DoubleLE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertDoubleLE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeDoubleLE, 8, value, offset);
    }
    // Strings
    /**
     * Reads a String from the current read position.
     *
     * @param arg1 { Number | String } The number of bytes to read as a String, or the BufferEncoding to use for
     *             the string (Defaults to instance level encoding).
     * @param encoding { String } The BufferEncoding to use for the string (Defaults to instance level encoding).
     *
     * @return { String }
     */ readString(arg1, encoding) {
        let lengthVal;
        // Length provided
        if (typeof arg1 === 'number') {
            utils_1.checkLengthValue(arg1);
            lengthVal = Math.min(arg1, this.length - this._readOffset);
        } else {
            encoding = arg1;
            lengthVal = this.length - this._readOffset;
        }
        // Check encoding
        if (typeof encoding !== 'undefined') {
            utils_1.checkEncoding(encoding);
        }
        const value = this._buff.slice(this._readOffset, this._readOffset + lengthVal).toString(encoding || this._encoding);
        this._readOffset += lengthVal;
        return value;
    }
    /**
     * Inserts a String
     *
     * @param value { String } The String value to insert.
     * @param offset { Number } The offset to insert the string at.
     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
     *
     * @return this
     */ insertString(value, offset, encoding) {
        utils_1.checkOffsetValue(offset);
        return this._handleString(value, true, offset, encoding);
    }
    /**
     * Writes a String
     *
     * @param value { String } The String value to write.
     * @param arg2 { Number | String } The offset to write the string at, or the BufferEncoding to use.
     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
     *
     * @return this
     */ writeString(value, arg2, encoding) {
        return this._handleString(value, false, arg2, encoding);
    }
    /**
     * Reads a null-terminated String from the current read position.
     *
     * @param encoding { String } The BufferEncoding to use for the string (Defaults to instance level encoding).
     *
     * @return { String }
     */ readStringNT(encoding) {
        if (typeof encoding !== 'undefined') {
            utils_1.checkEncoding(encoding);
        }
        // Set null character position to the end SmartBuffer instance.
        let nullPos = this.length;
        // Find next null character (if one is not found, default from above is used)
        for(let i = this._readOffset; i < this.length; i++){
            if (this._buff[i] === 0x00) {
                nullPos = i;
                break;
            }
        }
        // Read string value
        const value = this._buff.slice(this._readOffset, nullPos);
        // Increment internal Buffer read offset
        this._readOffset = nullPos + 1;
        return value.toString(encoding || this._encoding);
    }
    /**
     * Inserts a null-terminated String.
     *
     * @param value { String } The String value to write.
     * @param arg2 { Number | String } The offset to write the string to, or the BufferEncoding to use.
     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
     *
     * @return this
     */ insertStringNT(value, offset, encoding) {
        utils_1.checkOffsetValue(offset);
        // Write Values
        this.insertString(value, offset, encoding);
        this.insertUInt8(0x00, offset + value.length);
        return this;
    }
    /**
     * Writes a null-terminated String.
     *
     * @param value { String } The String value to write.
     * @param arg2 { Number | String } The offset to write the string to, or the BufferEncoding to use.
     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
     *
     * @return this
     */ writeStringNT(value, arg2, encoding) {
        // Write Values
        this.writeString(value, arg2, encoding);
        this.writeUInt8(0x00, typeof arg2 === 'number' ? arg2 + value.length : this.writeOffset);
        return this;
    }
    // Buffers
    /**
     * Reads a Buffer from the internal read position.
     *
     * @param length { Number } The length of data to read as a Buffer.
     *
     * @return { Buffer }
     */ readBuffer(length) {
        if (typeof length !== 'undefined') {
            utils_1.checkLengthValue(length);
        }
        const lengthVal = typeof length === 'number' ? length : this.length;
        const endPoint = Math.min(this.length, this._readOffset + lengthVal);
        // Read buffer value
        const value = this._buff.slice(this._readOffset, endPoint);
        // Increment internal Buffer read offset
        this._readOffset = endPoint;
        return value;
    }
    /**
     * Writes a Buffer to the current write position.
     *
     * @param value { Buffer } The Buffer to write.
     * @param offset { Number } The offset to write the Buffer to.
     *
     * @return this
     */ insertBuffer(value, offset) {
        utils_1.checkOffsetValue(offset);
        return this._handleBuffer(value, true, offset);
    }
    /**
     * Writes a Buffer to the current write position.
     *
     * @param value { Buffer } The Buffer to write.
     * @param offset { Number } The offset to write the Buffer to.
     *
     * @return this
     */ writeBuffer(value, offset) {
        return this._handleBuffer(value, false, offset);
    }
    /**
     * Reads a null-terminated Buffer from the current read poisiton.
     *
     * @return { Buffer }
     */ readBufferNT() {
        // Set null character position to the end SmartBuffer instance.
        let nullPos = this.length;
        // Find next null character (if one is not found, default from above is used)
        for(let i = this._readOffset; i < this.length; i++){
            if (this._buff[i] === 0x00) {
                nullPos = i;
                break;
            }
        }
        // Read value
        const value = this._buff.slice(this._readOffset, nullPos);
        // Increment internal Buffer read offset
        this._readOffset = nullPos + 1;
        return value;
    }
    /**
     * Inserts a null-terminated Buffer.
     *
     * @param value { Buffer } The Buffer to write.
     * @param offset { Number } The offset to write the Buffer to.
     *
     * @return this
     */ insertBufferNT(value, offset) {
        utils_1.checkOffsetValue(offset);
        // Write Values
        this.insertBuffer(value, offset);
        this.insertUInt8(0x00, offset + value.length);
        return this;
    }
    /**
     * Writes a null-terminated Buffer.
     *
     * @param value { Buffer } The Buffer to write.
     * @param offset { Number } The offset to write the Buffer to.
     *
     * @return this
     */ writeBufferNT(value, offset) {
        // Checks for valid numberic value;
        if (typeof offset !== 'undefined') {
            utils_1.checkOffsetValue(offset);
        }
        // Write Values
        this.writeBuffer(value, offset);
        this.writeUInt8(0x00, typeof offset === 'number' ? offset + value.length : this._writeOffset);
        return this;
    }
    /**
     * Clears the SmartBuffer instance to its original empty state.
     */ clear() {
        this._writeOffset = 0;
        this._readOffset = 0;
        this.length = 0;
        return this;
    }
    /**
     * Gets the remaining data left to be read from the SmartBuffer instance.
     *
     * @return { Number }
     */ remaining() {
        return this.length - this._readOffset;
    }
    /**
     * Gets the current read offset value of the SmartBuffer instance.
     *
     * @return { Number }
     */ get readOffset() {
        return this._readOffset;
    }
    /**
     * Sets the read offset value of the SmartBuffer instance.
     *
     * @param offset { Number } - The offset value to set.
     */ set readOffset(offset) {
        utils_1.checkOffsetValue(offset);
        // Check for bounds.
        utils_1.checkTargetOffset(offset, this);
        this._readOffset = offset;
    }
    /**
     * Gets the current write offset value of the SmartBuffer instance.
     *
     * @return { Number }
     */ get writeOffset() {
        return this._writeOffset;
    }
    /**
     * Sets the write offset value of the SmartBuffer instance.
     *
     * @param offset { Number } - The offset value to set.
     */ set writeOffset(offset) {
        utils_1.checkOffsetValue(offset);
        // Check for bounds.
        utils_1.checkTargetOffset(offset, this);
        this._writeOffset = offset;
    }
    /**
     * Gets the currently set string encoding of the SmartBuffer instance.
     *
     * @return { BufferEncoding } The string Buffer encoding currently set.
     */ get encoding() {
        return this._encoding;
    }
    /**
     * Sets the string encoding of the SmartBuffer instance.
     *
     * @param encoding { BufferEncoding } The string Buffer encoding to set.
     */ set encoding(encoding) {
        utils_1.checkEncoding(encoding);
        this._encoding = encoding;
    }
    /**
     * Gets the underlying internal Buffer. (This includes unmanaged data in the Buffer)
     *
     * @return { Buffer } The Buffer value.
     */ get internalBuffer() {
        return this._buff;
    }
    /**
     * Gets the value of the internal managed Buffer (Includes managed data only)
     *
     * @param { Buffer }
     */ toBuffer() {
        return this._buff.slice(0, this.length);
    }
    /**
     * Gets the String value of the internal managed Buffer
     *
     * @param encoding { String } The BufferEncoding to display the Buffer as (defaults to instance level encoding).
     */ toString(encoding) {
        const encodingVal = typeof encoding === 'string' ? encoding : this._encoding;
        // Check for invalid encoding.
        utils_1.checkEncoding(encodingVal);
        return this._buff.toString(encodingVal, 0, this.length);
    }
    /**
     * Destroys the SmartBuffer instance.
     */ destroy() {
        this.clear();
        return this;
    }
    /**
     * Handles inserting and writing strings.
     *
     * @param value { String } The String value to insert.
     * @param isInsert { Boolean } True if inserting a string, false if writing.
     * @param arg2 { Number | String } The offset to insert the string at, or the BufferEncoding to use.
     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
     */ _handleString(value, isInsert, arg3, encoding) {
        let offsetVal = this._writeOffset;
        let encodingVal = this._encoding;
        // Check for offset
        if (typeof arg3 === 'number') {
            offsetVal = arg3;
        // Check for encoding
        } else if (typeof arg3 === 'string') {
            utils_1.checkEncoding(arg3);
            encodingVal = arg3;
        }
        // Check for encoding (third param)
        if (typeof encoding === 'string') {
            utils_1.checkEncoding(encoding);
            encodingVal = encoding;
        }
        // Calculate bytelength of string.
        const byteLength = Buffer.byteLength(value, encodingVal);
        // Ensure there is enough internal Buffer capacity.
        if (isInsert) {
            this.ensureInsertable(byteLength, offsetVal);
        } else {
            this._ensureWriteable(byteLength, offsetVal);
        }
        // Write value
        this._buff.write(value, offsetVal, byteLength, encodingVal);
        // Increment internal Buffer write offset;
        if (isInsert) {
            this._writeOffset += byteLength;
        } else {
            // If an offset was given, check to see if we wrote beyond the current writeOffset.
            if (typeof arg3 === 'number') {
                this._writeOffset = Math.max(this._writeOffset, offsetVal + byteLength);
            } else {
                // If no offset was given, we wrote to the end of the SmartBuffer so increment writeOffset.
                this._writeOffset += byteLength;
            }
        }
        return this;
    }
    /**
     * Handles writing or insert of a Buffer.
     *
     * @param value { Buffer } The Buffer to write.
     * @param offset { Number } The offset to write the Buffer to.
     */ _handleBuffer(value, isInsert, offset) {
        const offsetVal = typeof offset === 'number' ? offset : this._writeOffset;
        // Ensure there is enough internal Buffer capacity.
        if (isInsert) {
            this.ensureInsertable(value.length, offsetVal);
        } else {
            this._ensureWriteable(value.length, offsetVal);
        }
        // Write buffer value
        value.copy(this._buff, offsetVal);
        // Increment internal Buffer write offset;
        if (isInsert) {
            this._writeOffset += value.length;
        } else {
            // If an offset was given, check to see if we wrote beyond the current writeOffset.
            if (typeof offset === 'number') {
                this._writeOffset = Math.max(this._writeOffset, offsetVal + value.length);
            } else {
                // If no offset was given, we wrote to the end of the SmartBuffer so increment writeOffset.
                this._writeOffset += value.length;
            }
        }
        return this;
    }
    /**
     * Ensures that the internal Buffer is large enough to read data.
     *
     * @param length { Number } The length of the data that needs to be read.
     * @param offset { Number } The offset of the data that needs to be read.
     */ ensureReadable(length, offset) {
        // Offset value defaults to managed read offset.
        let offsetVal = this._readOffset;
        // If an offset was provided, use it.
        if (typeof offset !== 'undefined') {
            // Checks for valid numberic value;
            utils_1.checkOffsetValue(offset);
            // Overide with custom offset.
            offsetVal = offset;
        }
        // Checks if offset is below zero, or the offset+length offset is beyond the total length of the managed data.
        if (offsetVal < 0 || offsetVal + length > this.length) {
            throw new Error(utils_1.ERRORS.INVALID_READ_BEYOND_BOUNDS);
        }
    }
    /**
     * Ensures that the internal Buffer is large enough to insert data.
     *
     * @param dataLength { Number } The length of the data that needs to be written.
     * @param offset { Number } The offset of the data to be written.
     */ ensureInsertable(dataLength, offset) {
        // Checks for valid numberic value;
        utils_1.checkOffsetValue(offset);
        // Ensure there is enough internal Buffer capacity.
        this._ensureCapacity(this.length + dataLength);
        // If an offset was provided and its not the very end of the buffer, copy data into appropriate location in regards to the offset.
        if (offset < this.length) {
            this._buff.copy(this._buff, offset + dataLength, offset, this._buff.length);
        }
        // Adjust tracked smart buffer length
        if (offset + dataLength > this.length) {
            this.length = offset + dataLength;
        } else {
            this.length += dataLength;
        }
    }
    /**
     * Ensures that the internal Buffer is large enough to write data.
     *
     * @param dataLength { Number } The length of the data that needs to be written.
     * @param offset { Number } The offset of the data to be written (defaults to writeOffset).
     */ _ensureWriteable(dataLength, offset) {
        const offsetVal = typeof offset === 'number' ? offset : this._writeOffset;
        // Ensure enough capacity to write data.
        this._ensureCapacity(offsetVal + dataLength);
        // Adjust SmartBuffer length (if offset + length is larger than managed length, adjust length)
        if (offsetVal + dataLength > this.length) {
            this.length = offsetVal + dataLength;
        }
    }
    /**
     * Ensures that the internal Buffer is large enough to write at least the given amount of data.
     *
     * @param minLength { Number } The minimum length of the data needs to be written.
     */ _ensureCapacity(minLength) {
        const oldLength = this._buff.length;
        if (minLength > oldLength) {
            let data = this._buff;
            let newLength = oldLength * 3 / 2 + 1;
            if (newLength < minLength) {
                newLength = minLength;
            }
            this._buff = Buffer.allocUnsafe(newLength);
            data.copy(this._buff, 0, 0, oldLength);
        }
    }
    /**
     * Reads a numeric number value using the provided function.
     *
     * @typeparam T { number | bigint } The type of the value to be read
     *
     * @param func { Function(offset: number) => number } The function to read data on the internal Buffer with.
     * @param byteSize { Number } The number of bytes read.
     * @param offset { Number } The offset to read from (optional). When this is not provided, the managed readOffset is used instead.
     *
     * @returns { T } the number value
     */ _readNumberValue(func, byteSize, offset) {
        this.ensureReadable(byteSize, offset);
        // Call Buffer.readXXXX();
        const value = func.call(this._buff, typeof offset === 'number' ? offset : this._readOffset);
        // Adjust internal read offset if an optional read offset was not provided.
        if (typeof offset === 'undefined') {
            this._readOffset += byteSize;
        }
        return value;
    }
    /**
     * Inserts a numeric number value based on the given offset and value.
     *
     * @typeparam T { number | bigint } The type of the value to be written
     *
     * @param func { Function(offset: T, offset?) => number} The function to write data on the internal Buffer with.
     * @param byteSize { Number } The number of bytes written.
     * @param value { T } The number value to write.
     * @param offset { Number } the offset to write the number at (REQUIRED).
     *
     * @returns SmartBuffer this buffer
     */ _insertNumberValue(func, byteSize, value, offset) {
        // Check for invalid offset values.
        utils_1.checkOffsetValue(offset);
        // Ensure there is enough internal Buffer capacity. (raw offset is passed)
        this.ensureInsertable(byteSize, offset);
        // Call buffer.writeXXXX();
        func.call(this._buff, value, offset);
        // Adjusts internally managed write offset.
        this._writeOffset += byteSize;
        return this;
    }
    /**
     * Writes a numeric number value based on the given offset and value.
     *
     * @typeparam T { number | bigint } The type of the value to be written
     *
     * @param func { Function(offset: T, offset?) => number} The function to write data on the internal Buffer with.
     * @param byteSize { Number } The number of bytes written.
     * @param value { T } The number value to write.
     * @param offset { Number } the offset to write the number at (REQUIRED).
     *
     * @returns SmartBuffer this buffer
     */ _writeNumberValue(func, byteSize, value, offset) {
        // If an offset was provided, validate it.
        if (typeof offset === 'number') {
            // Check if we're writing beyond the bounds of the managed data.
            if (offset < 0) {
                throw new Error(utils_1.ERRORS.INVALID_WRITE_BEYOND_BOUNDS);
            }
            utils_1.checkOffsetValue(offset);
        }
        // Default to writeOffset if no offset value was given.
        const offsetVal = typeof offset === 'number' ? offset : this._writeOffset;
        // Ensure there is enough internal Buffer capacity. (raw offset is passed)
        this._ensureWriteable(byteSize, offsetVal);
        func.call(this._buff, value, offsetVal);
        // If an offset was given, check to see if we wrote beyond the current writeOffset.
        if (typeof offset === 'number') {
            this._writeOffset = Math.max(this._writeOffset, offsetVal + byteSize);
        } else {
            // If no numeric offset was given, we wrote to the end of the SmartBuffer so increment writeOffset.
            this._writeOffset += byteSize;
        }
        return this;
    }
}
exports.SmartBuffer = SmartBuffer; //# sourceMappingURL=smartbuffer.js.map
}),
"[project]/node_modules/socks/build/common/constants.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SOCKS5_NO_ACCEPTABLE_AUTH = exports.SOCKS5_CUSTOM_AUTH_END = exports.SOCKS5_CUSTOM_AUTH_START = exports.SOCKS_INCOMING_PACKET_SIZES = exports.SocksClientState = exports.Socks5Response = exports.Socks5HostType = exports.Socks5Auth = exports.Socks4Response = exports.SocksCommand = exports.ERRORS = exports.DEFAULT_TIMEOUT = void 0;
const DEFAULT_TIMEOUT = 30000;
exports.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;
// prettier-ignore
const ERRORS = {
    InvalidSocksCommand: 'An invalid SOCKS command was provided. Valid options are connect, bind, and associate.',
    InvalidSocksCommandForOperation: 'An invalid SOCKS command was provided. Only a subset of commands are supported for this operation.',
    InvalidSocksCommandChain: 'An invalid SOCKS command was provided. Chaining currently only supports the connect command.',
    InvalidSocksClientOptionsDestination: 'An invalid destination host was provided.',
    InvalidSocksClientOptionsExistingSocket: 'An invalid existing socket was provided. This should be an instance of stream.Duplex.',
    InvalidSocksClientOptionsProxy: 'Invalid SOCKS proxy details were provided.',
    InvalidSocksClientOptionsTimeout: 'An invalid timeout value was provided. Please enter a value above 0 (in ms).',
    InvalidSocksClientOptionsProxiesLength: 'At least two socks proxies must be provided for chaining.',
    InvalidSocksClientOptionsCustomAuthRange: 'Custom auth must be a value between 0x80 and 0xFE.',
    InvalidSocksClientOptionsCustomAuthOptions: 'When a custom_auth_method is provided, custom_auth_request_handler, custom_auth_response_size, and custom_auth_response_handler must also be provided and valid.',
    NegotiationError: 'Negotiation error',
    SocketClosed: 'Socket closed',
    ProxyConnectionTimedOut: 'Proxy connection timed out',
    InternalError: 'SocksClient internal error (this should not happen)',
    InvalidSocks4HandshakeResponse: 'Received invalid Socks4 handshake response',
    Socks4ProxyRejectedConnection: 'Socks4 Proxy rejected connection',
    InvalidSocks4IncomingConnectionResponse: 'Socks4 invalid incoming connection response',
    Socks4ProxyRejectedIncomingBoundConnection: 'Socks4 Proxy rejected incoming bound connection',
    InvalidSocks5InitialHandshakeResponse: 'Received invalid Socks5 initial handshake response',
    InvalidSocks5IntiailHandshakeSocksVersion: 'Received invalid Socks5 initial handshake (invalid socks version)',
    InvalidSocks5InitialHandshakeNoAcceptedAuthType: 'Received invalid Socks5 initial handshake (no accepted authentication type)',
    InvalidSocks5InitialHandshakeUnknownAuthType: 'Received invalid Socks5 initial handshake (unknown authentication type)',
    Socks5AuthenticationFailed: 'Socks5 Authentication failed',
    InvalidSocks5FinalHandshake: 'Received invalid Socks5 final handshake response',
    InvalidSocks5FinalHandshakeRejected: 'Socks5 proxy rejected connection',
    InvalidSocks5IncomingConnectionResponse: 'Received invalid Socks5 incoming connection response',
    Socks5ProxyRejectedIncomingBoundConnection: 'Socks5 Proxy rejected incoming bound connection'
};
exports.ERRORS = ERRORS;
const SOCKS_INCOMING_PACKET_SIZES = {
    Socks5InitialHandshakeResponse: 2,
    Socks5UserPassAuthenticationResponse: 2,
    // Command response + incoming connection (bind)
    Socks5ResponseHeader: 5,
    Socks5ResponseIPv4: 10,
    Socks5ResponseIPv6: 22,
    Socks5ResponseHostname: (hostNameLength)=>hostNameLength + 7,
    // Command response + incoming connection (bind)
    Socks4Response: 8
};
exports.SOCKS_INCOMING_PACKET_SIZES = SOCKS_INCOMING_PACKET_SIZES;
var SocksCommand;
(function(SocksCommand) {
    SocksCommand[SocksCommand["connect"] = 1] = "connect";
    SocksCommand[SocksCommand["bind"] = 2] = "bind";
    SocksCommand[SocksCommand["associate"] = 3] = "associate";
})(SocksCommand || (exports.SocksCommand = SocksCommand = {}));
var Socks4Response;
(function(Socks4Response) {
    Socks4Response[Socks4Response["Granted"] = 90] = "Granted";
    Socks4Response[Socks4Response["Failed"] = 91] = "Failed";
    Socks4Response[Socks4Response["Rejected"] = 92] = "Rejected";
    Socks4Response[Socks4Response["RejectedIdent"] = 93] = "RejectedIdent";
})(Socks4Response || (exports.Socks4Response = Socks4Response = {}));
var Socks5Auth;
(function(Socks5Auth) {
    Socks5Auth[Socks5Auth["NoAuth"] = 0] = "NoAuth";
    Socks5Auth[Socks5Auth["GSSApi"] = 1] = "GSSApi";
    Socks5Auth[Socks5Auth["UserPass"] = 2] = "UserPass";
})(Socks5Auth || (exports.Socks5Auth = Socks5Auth = {}));
const SOCKS5_CUSTOM_AUTH_START = 0x80;
exports.SOCKS5_CUSTOM_AUTH_START = SOCKS5_CUSTOM_AUTH_START;
const SOCKS5_CUSTOM_AUTH_END = 0xfe;
exports.SOCKS5_CUSTOM_AUTH_END = SOCKS5_CUSTOM_AUTH_END;
const SOCKS5_NO_ACCEPTABLE_AUTH = 0xff;
exports.SOCKS5_NO_ACCEPTABLE_AUTH = SOCKS5_NO_ACCEPTABLE_AUTH;
var Socks5Response;
(function(Socks5Response) {
    Socks5Response[Socks5Response["Granted"] = 0] = "Granted";
    Socks5Response[Socks5Response["Failure"] = 1] = "Failure";
    Socks5Response[Socks5Response["NotAllowed"] = 2] = "NotAllowed";
    Socks5Response[Socks5Response["NetworkUnreachable"] = 3] = "NetworkUnreachable";
    Socks5Response[Socks5Response["HostUnreachable"] = 4] = "HostUnreachable";
    Socks5Response[Socks5Response["ConnectionRefused"] = 5] = "ConnectionRefused";
    Socks5Response[Socks5Response["TTLExpired"] = 6] = "TTLExpired";
    Socks5Response[Socks5Response["CommandNotSupported"] = 7] = "CommandNotSupported";
    Socks5Response[Socks5Response["AddressNotSupported"] = 8] = "AddressNotSupported";
})(Socks5Response || (exports.Socks5Response = Socks5Response = {}));
var Socks5HostType;
(function(Socks5HostType) {
    Socks5HostType[Socks5HostType["IPv4"] = 1] = "IPv4";
    Socks5HostType[Socks5HostType["Hostname"] = 3] = "Hostname";
    Socks5HostType[Socks5HostType["IPv6"] = 4] = "IPv6";
})(Socks5HostType || (exports.Socks5HostType = Socks5HostType = {}));
var SocksClientState;
(function(SocksClientState) {
    SocksClientState[SocksClientState["Created"] = 0] = "Created";
    SocksClientState[SocksClientState["Connecting"] = 1] = "Connecting";
    SocksClientState[SocksClientState["Connected"] = 2] = "Connected";
    SocksClientState[SocksClientState["SentInitialHandshake"] = 3] = "SentInitialHandshake";
    SocksClientState[SocksClientState["ReceivedInitialHandshakeResponse"] = 4] = "ReceivedInitialHandshakeResponse";
    SocksClientState[SocksClientState["SentAuthentication"] = 5] = "SentAuthentication";
    SocksClientState[SocksClientState["ReceivedAuthenticationResponse"] = 6] = "ReceivedAuthenticationResponse";
    SocksClientState[SocksClientState["SentFinalHandshake"] = 7] = "SentFinalHandshake";
    SocksClientState[SocksClientState["ReceivedFinalResponse"] = 8] = "ReceivedFinalResponse";
    SocksClientState[SocksClientState["BoundWaitingForConnection"] = 9] = "BoundWaitingForConnection";
    SocksClientState[SocksClientState["Established"] = 10] = "Established";
    SocksClientState[SocksClientState["Disconnected"] = 11] = "Disconnected";
    SocksClientState[SocksClientState["Error"] = 99] = "Error";
})(SocksClientState || (exports.SocksClientState = SocksClientState = {})); //# sourceMappingURL=constants.js.map
}),
"[project]/node_modules/socks/build/common/util.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SocksClientError = void 0;
exports.shuffleArray = shuffleArray;
/**
 * Error wrapper for SocksClient
 */ class SocksClientError extends Error {
    constructor(message, options){
        super(message);
        this.options = options;
    }
}
exports.SocksClientError = SocksClientError;
/**
 * Shuffles a given array.
 * @param array The array to shuffle.
 */ function shuffleArray(array) {
    for(let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [
            array[j],
            array[i]
        ];
    }
} //# sourceMappingURL=util.js.map
}),
"[project]/node_modules/socks/build/common/helpers.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.validateSocksClientOptions = validateSocksClientOptions;
exports.validateSocksClientChainOptions = validateSocksClientChainOptions;
exports.ipv4ToInt32 = ipv4ToInt32;
exports.int32ToIpv4 = int32ToIpv4;
exports.ipToBuffer = ipToBuffer;
const util_1 = __turbopack_context__.r("[project]/node_modules/socks/build/common/util.js [app-route] (ecmascript)");
const constants_1 = __turbopack_context__.r("[project]/node_modules/socks/build/common/constants.js [app-route] (ecmascript)");
const stream = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)");
const ip_address_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/ip-address.js [app-route] (ecmascript)");
const net = __turbopack_context__.r("[externals]/net [external] (net, cjs)");
/**
 * Validates the provided SocksClientOptions
 * @param options { SocksClientOptions }
 * @param acceptedCommands { string[] } A list of accepted SocksProxy commands.
 */ function validateSocksClientOptions(options, acceptedCommands = [
    'connect',
    'bind',
    'associate'
]) {
    // Check SOCKs command option.
    if (!constants_1.SocksCommand[options.command]) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksCommand, options);
    }
    // Check SocksCommand for acceptable command.
    if (acceptedCommands.indexOf(options.command) === -1) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksCommandForOperation, options);
    }
    // Check destination
    if (!isValidSocksRemoteHost(options.destination)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsDestination, options);
    }
    // Check SOCKS proxy to use
    if (!isValidSocksProxy(options.proxy)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsProxy, options);
    }
    // Validate custom auth (if set)
    validateCustomProxyAuth(options.proxy, options);
    // Check timeout
    if (options.timeout && !isValidTimeoutValue(options.timeout)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsTimeout, options);
    }
    // Check existing_socket (if provided)
    if (options.existing_socket && !(options.existing_socket instanceof stream.Duplex)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsExistingSocket, options);
    }
}
/**
 * Validates the SocksClientChainOptions
 * @param options { SocksClientChainOptions }
 */ function validateSocksClientChainOptions(options) {
    // Only connect is supported when chaining.
    if (options.command !== 'connect') {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksCommandChain, options);
    }
    // Check destination
    if (!isValidSocksRemoteHost(options.destination)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsDestination, options);
    }
    // Validate proxies (length)
    if (!(options.proxies && Array.isArray(options.proxies) && options.proxies.length >= 2)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsProxiesLength, options);
    }
    // Validate proxies
    options.proxies.forEach((proxy)=>{
        if (!isValidSocksProxy(proxy)) {
            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsProxy, options);
        }
        // Validate custom auth (if set)
        validateCustomProxyAuth(proxy, options);
    });
    // Check timeout
    if (options.timeout && !isValidTimeoutValue(options.timeout)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsTimeout, options);
    }
}
function validateCustomProxyAuth(proxy, options) {
    if (proxy.custom_auth_method !== undefined) {
        // Invalid auth method range
        if (proxy.custom_auth_method < constants_1.SOCKS5_CUSTOM_AUTH_START || proxy.custom_auth_method > constants_1.SOCKS5_CUSTOM_AUTH_END) {
            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthRange, options);
        }
        // Missing custom_auth_request_handler
        if (proxy.custom_auth_request_handler === undefined || typeof proxy.custom_auth_request_handler !== 'function') {
            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthOptions, options);
        }
        // Missing custom_auth_response_size
        if (proxy.custom_auth_response_size === undefined) {
            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthOptions, options);
        }
        // Missing/invalid custom_auth_response_handler
        if (proxy.custom_auth_response_handler === undefined || typeof proxy.custom_auth_response_handler !== 'function') {
            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthOptions, options);
        }
    }
}
/**
 * Validates a SocksRemoteHost
 * @param remoteHost { SocksRemoteHost }
 */ function isValidSocksRemoteHost(remoteHost) {
    return remoteHost && typeof remoteHost.host === 'string' && Buffer.byteLength(remoteHost.host) < 256 && typeof remoteHost.port === 'number' && remoteHost.port >= 0 && remoteHost.port <= 65535;
}
/**
 * Validates a SocksProxy
 * @param proxy { SocksProxy }
 */ function isValidSocksProxy(proxy) {
    return proxy && (typeof proxy.host === 'string' || typeof proxy.ipaddress === 'string') && typeof proxy.port === 'number' && proxy.port >= 0 && proxy.port <= 65535 && (proxy.type === 4 || proxy.type === 5);
}
/**
 * Validates a timeout value.
 * @param value { Number }
 */ function isValidTimeoutValue(value) {
    return typeof value === 'number' && value > 0;
}
function ipv4ToInt32(ip) {
    const address = new ip_address_1.Address4(ip);
    // Convert the IPv4 address parts to an integer
    return address.toArray().reduce((acc, part)=>(acc << 8) + part, 0) >>> 0;
}
function int32ToIpv4(int32) {
    // Extract each byte (octet) from the 32-bit integer
    const octet1 = int32 >>> 24 & 0xff;
    const octet2 = int32 >>> 16 & 0xff;
    const octet3 = int32 >>> 8 & 0xff;
    const octet4 = int32 & 0xff;
    // Combine the octets into a string in IPv4 format
    return [
        octet1,
        octet2,
        octet3,
        octet4
    ].join('.');
}
function ipToBuffer(ip) {
    if (net.isIPv4(ip)) {
        // Handle IPv4 addresses
        const address = new ip_address_1.Address4(ip);
        return Buffer.from(address.toArray());
    } else if (net.isIPv6(ip)) {
        // Handle IPv6 addresses
        const address = new ip_address_1.Address6(ip);
        return Buffer.from(address.canonicalForm().split(':').map((segment)=>segment.padStart(4, '0')).join(''), 'hex');
    } else {
        throw new Error('Invalid IP address format');
    }
} //# sourceMappingURL=helpers.js.map
}),
"[project]/node_modules/socks/build/common/receivebuffer.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ReceiveBuffer = void 0;
class ReceiveBuffer {
    constructor(size = 4096){
        this.buffer = Buffer.allocUnsafe(size);
        this.offset = 0;
        this.originalSize = size;
    }
    get length() {
        return this.offset;
    }
    append(data) {
        if (!Buffer.isBuffer(data)) {
            throw new Error('Attempted to append a non-buffer instance to ReceiveBuffer.');
        }
        if (this.offset + data.length >= this.buffer.length) {
            const tmp = this.buffer;
            this.buffer = Buffer.allocUnsafe(Math.max(this.buffer.length + this.originalSize, this.buffer.length + data.length));
            tmp.copy(this.buffer);
        }
        data.copy(this.buffer, this.offset);
        return this.offset += data.length;
    }
    peek(length) {
        if (length > this.offset) {
            throw new Error('Attempted to read beyond the bounds of the managed internal data.');
        }
        return this.buffer.slice(0, length);
    }
    get(length) {
        if (length > this.offset) {
            throw new Error('Attempted to read beyond the bounds of the managed internal data.');
        }
        const value = Buffer.allocUnsafe(length);
        this.buffer.slice(0, length).copy(value);
        this.buffer.copyWithin(0, length, length + this.offset - length);
        this.offset -= length;
        return value;
    }
}
exports.ReceiveBuffer = ReceiveBuffer; //# sourceMappingURL=receivebuffer.js.map
}),
"[project]/node_modules/socks/build/client/socksclient.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __awaiter = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SocksClientError = exports.SocksClient = void 0;
const events_1 = __turbopack_context__.r("[externals]/events [external] (events, cjs)");
const net = __turbopack_context__.r("[externals]/net [external] (net, cjs)");
const smart_buffer_1 = __turbopack_context__.r("[project]/node_modules/smart-buffer/build/smartbuffer.js [app-route] (ecmascript)");
const constants_1 = __turbopack_context__.r("[project]/node_modules/socks/build/common/constants.js [app-route] (ecmascript)");
const helpers_1 = __turbopack_context__.r("[project]/node_modules/socks/build/common/helpers.js [app-route] (ecmascript)");
const receivebuffer_1 = __turbopack_context__.r("[project]/node_modules/socks/build/common/receivebuffer.js [app-route] (ecmascript)");
const util_1 = __turbopack_context__.r("[project]/node_modules/socks/build/common/util.js [app-route] (ecmascript)");
Object.defineProperty(exports, "SocksClientError", {
    enumerable: true,
    get: function() {
        return util_1.SocksClientError;
    }
});
const ip_address_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/ip-address.js [app-route] (ecmascript)");
class SocksClient extends events_1.EventEmitter {
    constructor(options){
        super();
        this.options = Object.assign({}, options);
        // Validate SocksClientOptions
        (0, helpers_1.validateSocksClientOptions)(options);
        // Default state
        this.setState(constants_1.SocksClientState.Created);
    }
    /**
     * Creates a new SOCKS connection.
     *
     * Note: Supports callbacks and promises. Only supports the connect command.
     * @param options { SocksClientOptions } Options.
     * @param callback { Function } An optional callback function.
     * @returns { Promise }
     */ static createConnection(options, callback) {
        return new Promise((resolve, reject)=>{
            // Validate SocksClientOptions
            try {
                (0, helpers_1.validateSocksClientOptions)(options, [
                    'connect'
                ]);
            } catch (err) {
                if (typeof callback === 'function') {
                    callback(err);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return resolve(err); // Resolves pending promise (prevents memory leaks).
                } else {
                    return reject(err);
                }
            }
            const client = new SocksClient(options);
            client.connect(options.existing_socket);
            client.once('established', (info)=>{
                client.removeAllListeners();
                if (typeof callback === 'function') {
                    callback(null, info);
                    resolve(info); // Resolves pending promise (prevents memory leaks).
                } else {
                    resolve(info);
                }
            });
            // Error occurred, failed to establish connection.
            client.once('error', (err)=>{
                client.removeAllListeners();
                if (typeof callback === 'function') {
                    callback(err);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve(err); // Resolves pending promise (prevents memory leaks).
                } else {
                    reject(err);
                }
            });
        });
    }
    /**
     * Creates a new SOCKS connection chain to a destination host through 2 or more SOCKS proxies.
     *
     * Note: Supports callbacks and promises. Only supports the connect method.
     * Note: Implemented via createConnection() factory function.
     * @param options { SocksClientChainOptions } Options
     * @param callback { Function } An optional callback function.
     * @returns { Promise }
     */ static createConnectionChain(options, callback) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise((resolve, reject)=>__awaiter(this, void 0, void 0, function*() {
                // Validate SocksClientChainOptions
                try {
                    (0, helpers_1.validateSocksClientChainOptions)(options);
                } catch (err) {
                    if (typeof callback === 'function') {
                        callback(err);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        return resolve(err); // Resolves pending promise (prevents memory leaks).
                    } else {
                        return reject(err);
                    }
                }
                // Shuffle proxies
                if (options.randomizeChain) {
                    (0, util_1.shuffleArray)(options.proxies);
                }
                try {
                    let sock;
                    for(let i = 0; i < options.proxies.length; i++){
                        const nextProxy = options.proxies[i];
                        // If we've reached the last proxy in the chain, the destination is the actual destination, otherwise it's the next proxy.
                        const nextDestination = i === options.proxies.length - 1 ? options.destination : {
                            host: options.proxies[i + 1].host || options.proxies[i + 1].ipaddress,
                            port: options.proxies[i + 1].port
                        };
                        // Creates the next connection in the chain.
                        const result = yield SocksClient.createConnection({
                            command: 'connect',
                            proxy: nextProxy,
                            destination: nextDestination,
                            existing_socket: sock
                        });
                        // If sock is undefined, assign it here.
                        sock = sock || result.socket;
                    }
                    if (typeof callback === 'function') {
                        callback(null, {
                            socket: sock
                        });
                        resolve({
                            socket: sock
                        }); // Resolves pending promise (prevents memory leaks).
                    } else {
                        resolve({
                            socket: sock
                        });
                    }
                } catch (err) {
                    if (typeof callback === 'function') {
                        callback(err);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        resolve(err); // Resolves pending promise (prevents memory leaks).
                    } else {
                        reject(err);
                    }
                }
            }));
    }
    /**
     * Creates a SOCKS UDP Frame.
     * @param options
     */ static createUDPFrame(options) {
        const buff = new smart_buffer_1.SmartBuffer();
        buff.writeUInt16BE(0);
        buff.writeUInt8(options.frameNumber || 0);
        // IPv4/IPv6/Hostname
        if (net.isIPv4(options.remoteHost.host)) {
            buff.writeUInt8(constants_1.Socks5HostType.IPv4);
            buff.writeUInt32BE((0, helpers_1.ipv4ToInt32)(options.remoteHost.host));
        } else if (net.isIPv6(options.remoteHost.host)) {
            buff.writeUInt8(constants_1.Socks5HostType.IPv6);
            buff.writeBuffer((0, helpers_1.ipToBuffer)(options.remoteHost.host));
        } else {
            buff.writeUInt8(constants_1.Socks5HostType.Hostname);
            buff.writeUInt8(Buffer.byteLength(options.remoteHost.host));
            buff.writeString(options.remoteHost.host);
        }
        // Port
        buff.writeUInt16BE(options.remoteHost.port);
        // Data
        buff.writeBuffer(options.data);
        return buff.toBuffer();
    }
    /**
     * Parses a SOCKS UDP frame.
     * @param data
     */ static parseUDPFrame(data) {
        const buff = smart_buffer_1.SmartBuffer.fromBuffer(data);
        buff.readOffset = 2;
        const frameNumber = buff.readUInt8();
        const hostType = buff.readUInt8();
        let remoteHost;
        if (hostType === constants_1.Socks5HostType.IPv4) {
            remoteHost = (0, helpers_1.int32ToIpv4)(buff.readUInt32BE());
        } else if (hostType === constants_1.Socks5HostType.IPv6) {
            remoteHost = ip_address_1.Address6.fromByteArray(Array.from(buff.readBuffer(16))).canonicalForm();
        } else {
            remoteHost = buff.readString(buff.readUInt8());
        }
        const remotePort = buff.readUInt16BE();
        return {
            frameNumber,
            remoteHost: {
                host: remoteHost,
                port: remotePort
            },
            data: buff.readBuffer()
        };
    }
    /**
     * Internal state setter. If the SocksClient is in an error state, it cannot be changed to a non error state.
     */ setState(newState) {
        if (this.state !== constants_1.SocksClientState.Error) {
            this.state = newState;
        }
    }
    /**
     * Starts the connection establishment to the proxy and destination.
     * @param existingSocket Connected socket to use instead of creating a new one (internal use).
     */ connect(existingSocket) {
        this.onDataReceived = (data)=>this.onDataReceivedHandler(data);
        this.onClose = ()=>this.onCloseHandler();
        this.onError = (err)=>this.onErrorHandler(err);
        this.onConnect = ()=>this.onConnectHandler();
        // Start timeout timer (defaults to 30 seconds)
        const timer = setTimeout(()=>this.onEstablishedTimeout(), this.options.timeout || constants_1.DEFAULT_TIMEOUT);
        // check whether unref is available as it differs from browser to NodeJS (#33)
        if (timer.unref && typeof timer.unref === 'function') {
            timer.unref();
        }
        // If an existing socket is provided, use it to negotiate SOCKS handshake. Otherwise create a new Socket.
        if (existingSocket) {
            this.socket = existingSocket;
        } else {
            this.socket = new net.Socket();
        }
        // Attach Socket error handlers.
        this.socket.once('close', this.onClose);
        this.socket.once('error', this.onError);
        this.socket.once('connect', this.onConnect);
        this.socket.on('data', this.onDataReceived);
        this.setState(constants_1.SocksClientState.Connecting);
        this.receiveBuffer = new receivebuffer_1.ReceiveBuffer();
        if (existingSocket) {
            this.socket.emit('connect');
        } else {
            this.socket.connect(this.getSocketOptions());
            if (this.options.set_tcp_nodelay !== undefined && this.options.set_tcp_nodelay !== null) {
                this.socket.setNoDelay(!!this.options.set_tcp_nodelay);
            }
        }
        // Listen for established event so we can re-emit any excess data received during handshakes.
        this.prependOnceListener('established', (info)=>{
            setImmediate(()=>{
                if (this.receiveBuffer.length > 0) {
                    const excessData = this.receiveBuffer.get(this.receiveBuffer.length);
                    info.socket.emit('data', excessData);
                }
                info.socket.resume();
            });
        });
    }
    // Socket options (defaults host/port to options.proxy.host/options.proxy.port)
    getSocketOptions() {
        return Object.assign(Object.assign({}, this.options.socket_options), {
            host: this.options.proxy.host || this.options.proxy.ipaddress,
            port: this.options.proxy.port
        });
    }
    /**
     * Handles internal Socks timeout callback.
     * Note: If the Socks client is not BoundWaitingForConnection or Established, the connection will be closed.
     */ onEstablishedTimeout() {
        if (this.state !== constants_1.SocksClientState.Established && this.state !== constants_1.SocksClientState.BoundWaitingForConnection) {
            this.closeSocket(constants_1.ERRORS.ProxyConnectionTimedOut);
        }
    }
    /**
     * Handles Socket connect event.
     */ onConnectHandler() {
        this.setState(constants_1.SocksClientState.Connected);
        // Send initial handshake.
        if (this.options.proxy.type === 4) {
            this.sendSocks4InitialHandshake();
        } else {
            this.sendSocks5InitialHandshake();
        }
        this.setState(constants_1.SocksClientState.SentInitialHandshake);
    }
    /**
     * Handles Socket data event.
     * @param data
     */ onDataReceivedHandler(data) {
        /*
          All received data is appended to a ReceiveBuffer.
          This makes sure that all the data we need is received before we attempt to process it.
        */ this.receiveBuffer.append(data);
        // Process data that we have.
        this.processData();
    }
    /**
     * Handles processing of the data we have received.
     */ processData() {
        // If we have enough data to process the next step in the SOCKS handshake, proceed.
        while(this.state !== constants_1.SocksClientState.Established && this.state !== constants_1.SocksClientState.Error && this.receiveBuffer.length >= this.nextRequiredPacketBufferSize){
            // Sent initial handshake, waiting for response.
            if (this.state === constants_1.SocksClientState.SentInitialHandshake) {
                if (this.options.proxy.type === 4) {
                    // Socks v4 only has one handshake response.
                    this.handleSocks4FinalHandshakeResponse();
                } else {
                    // Socks v5 has two handshakes, handle initial one here.
                    this.handleInitialSocks5HandshakeResponse();
                }
            // Sent auth request for Socks v5, waiting for response.
            } else if (this.state === constants_1.SocksClientState.SentAuthentication) {
                this.handleInitialSocks5AuthenticationHandshakeResponse();
            // Sent final Socks v5 handshake, waiting for final response.
            } else if (this.state === constants_1.SocksClientState.SentFinalHandshake) {
                this.handleSocks5FinalHandshakeResponse();
            // Socks BIND established. Waiting for remote connection via proxy.
            } else if (this.state === constants_1.SocksClientState.BoundWaitingForConnection) {
                if (this.options.proxy.type === 4) {
                    this.handleSocks4IncomingConnectionResponse();
                } else {
                    this.handleSocks5IncomingConnectionResponse();
                }
            } else {
                this.closeSocket(constants_1.ERRORS.InternalError);
                break;
            }
        }
    }
    /**
     * Handles Socket close event.
     * @param had_error
     */ onCloseHandler() {
        this.closeSocket(constants_1.ERRORS.SocketClosed);
    }
    /**
     * Handles Socket error event.
     * @param err
     */ onErrorHandler(err) {
        this.closeSocket(err.message);
    }
    /**
     * Removes internal event listeners on the underlying Socket.
     */ removeInternalSocketHandlers() {
        // Pauses data flow of the socket (this is internally resumed after 'established' is emitted)
        this.socket.pause();
        this.socket.removeListener('data', this.onDataReceived);
        this.socket.removeListener('close', this.onClose);
        this.socket.removeListener('error', this.onError);
        this.socket.removeListener('connect', this.onConnect);
    }
    /**
     * Closes and destroys the underlying Socket. Emits an error event.
     * @param err { String } An error string to include in error event.
     */ closeSocket(err) {
        // Make sure only one 'error' event is fired for the lifetime of this SocksClient instance.
        if (this.state !== constants_1.SocksClientState.Error) {
            // Set internal state to Error.
            this.setState(constants_1.SocksClientState.Error);
            // Destroy Socket
            this.socket.destroy();
            // Remove internal listeners
            this.removeInternalSocketHandlers();
            // Fire 'error' event.
            this.emit('error', new util_1.SocksClientError(err, this.options));
        }
    }
    /**
     * Sends initial Socks v4 handshake request.
     */ sendSocks4InitialHandshake() {
        const userId = this.options.proxy.userId || '';
        const buff = new smart_buffer_1.SmartBuffer();
        buff.writeUInt8(0x04);
        buff.writeUInt8(constants_1.SocksCommand[this.options.command]);
        buff.writeUInt16BE(this.options.destination.port);
        // Socks 4 (IPv4)
        if (net.isIPv4(this.options.destination.host)) {
            buff.writeBuffer((0, helpers_1.ipToBuffer)(this.options.destination.host));
            buff.writeStringNT(userId);
        // Socks 4a (hostname)
        } else {
            buff.writeUInt8(0x00);
            buff.writeUInt8(0x00);
            buff.writeUInt8(0x00);
            buff.writeUInt8(0x01);
            buff.writeStringNT(userId);
            buff.writeStringNT(this.options.destination.host);
        }
        this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks4Response;
        this.socket.write(buff.toBuffer());
    }
    /**
     * Handles Socks v4 handshake response.
     * @param data
     */ handleSocks4FinalHandshakeResponse() {
        const data = this.receiveBuffer.get(8);
        if (data[1] !== constants_1.Socks4Response.Granted) {
            this.closeSocket(`${constants_1.ERRORS.Socks4ProxyRejectedConnection} - (${constants_1.Socks4Response[data[1]]})`);
        } else {
            // Bind response
            if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.bind) {
                const buff = smart_buffer_1.SmartBuffer.fromBuffer(data);
                buff.readOffset = 2;
                const remoteHost = {
                    port: buff.readUInt16BE(),
                    host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE())
                };
                // If host is 0.0.0.0, set to proxy host.
                if (remoteHost.host === '0.0.0.0') {
                    remoteHost.host = this.options.proxy.ipaddress;
                }
                this.setState(constants_1.SocksClientState.BoundWaitingForConnection);
                this.emit('bound', {
                    remoteHost,
                    socket: this.socket
                });
            // Connect response
            } else {
                this.setState(constants_1.SocksClientState.Established);
                this.removeInternalSocketHandlers();
                this.emit('established', {
                    socket: this.socket
                });
            }
        }
    }
    /**
     * Handles Socks v4 incoming connection request (BIND)
     * @param data
     */ handleSocks4IncomingConnectionResponse() {
        const data = this.receiveBuffer.get(8);
        if (data[1] !== constants_1.Socks4Response.Granted) {
            this.closeSocket(`${constants_1.ERRORS.Socks4ProxyRejectedIncomingBoundConnection} - (${constants_1.Socks4Response[data[1]]})`);
        } else {
            const buff = smart_buffer_1.SmartBuffer.fromBuffer(data);
            buff.readOffset = 2;
            const remoteHost = {
                port: buff.readUInt16BE(),
                host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE())
            };
            this.setState(constants_1.SocksClientState.Established);
            this.removeInternalSocketHandlers();
            this.emit('established', {
                remoteHost,
                socket: this.socket
            });
        }
    }
    /**
     * Sends initial Socks v5 handshake request.
     */ sendSocks5InitialHandshake() {
        const buff = new smart_buffer_1.SmartBuffer();
        // By default we always support no auth.
        const supportedAuthMethods = [
            constants_1.Socks5Auth.NoAuth
        ];
        // We should only tell the proxy we support user/pass auth if auth info is actually provided.
        // Note: As of Tor v0.3.5.7+, if user/pass auth is an option from the client, by default it will always take priority.
        if (this.options.proxy.userId || this.options.proxy.password) {
            supportedAuthMethods.push(constants_1.Socks5Auth.UserPass);
        }
        // Custom auth method?
        if (this.options.proxy.custom_auth_method !== undefined) {
            supportedAuthMethods.push(this.options.proxy.custom_auth_method);
        }
        // Build handshake packet
        buff.writeUInt8(0x05);
        buff.writeUInt8(supportedAuthMethods.length);
        for (const authMethod of supportedAuthMethods){
            buff.writeUInt8(authMethod);
        }
        this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5InitialHandshakeResponse;
        this.socket.write(buff.toBuffer());
        this.setState(constants_1.SocksClientState.SentInitialHandshake);
    }
    /**
     * Handles initial Socks v5 handshake response.
     * @param data
     */ handleInitialSocks5HandshakeResponse() {
        const data = this.receiveBuffer.get(2);
        if (data[0] !== 0x05) {
            this.closeSocket(constants_1.ERRORS.InvalidSocks5IntiailHandshakeSocksVersion);
        } else if (data[1] === constants_1.SOCKS5_NO_ACCEPTABLE_AUTH) {
            this.closeSocket(constants_1.ERRORS.InvalidSocks5InitialHandshakeNoAcceptedAuthType);
        } else {
            // If selected Socks v5 auth method is no auth, send final handshake request.
            if (data[1] === constants_1.Socks5Auth.NoAuth) {
                this.socks5ChosenAuthType = constants_1.Socks5Auth.NoAuth;
                this.sendSocks5CommandRequest();
            // If selected Socks v5 auth method is user/password, send auth handshake.
            } else if (data[1] === constants_1.Socks5Auth.UserPass) {
                this.socks5ChosenAuthType = constants_1.Socks5Auth.UserPass;
                this.sendSocks5UserPassAuthentication();
            // If selected Socks v5 auth method is the custom_auth_method, send custom handshake.
            } else if (data[1] === this.options.proxy.custom_auth_method) {
                this.socks5ChosenAuthType = this.options.proxy.custom_auth_method;
                this.sendSocks5CustomAuthentication();
            } else {
                this.closeSocket(constants_1.ERRORS.InvalidSocks5InitialHandshakeUnknownAuthType);
            }
        }
    }
    /**
     * Sends Socks v5 user & password auth handshake.
     *
     * Note: No auth and user/pass are currently supported.
     */ sendSocks5UserPassAuthentication() {
        const userId = this.options.proxy.userId || '';
        const password = this.options.proxy.password || '';
        const buff = new smart_buffer_1.SmartBuffer();
        buff.writeUInt8(0x01);
        buff.writeUInt8(Buffer.byteLength(userId));
        buff.writeString(userId);
        buff.writeUInt8(Buffer.byteLength(password));
        buff.writeString(password);
        this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5UserPassAuthenticationResponse;
        this.socket.write(buff.toBuffer());
        this.setState(constants_1.SocksClientState.SentAuthentication);
    }
    sendSocks5CustomAuthentication() {
        return __awaiter(this, void 0, void 0, function*() {
            this.nextRequiredPacketBufferSize = this.options.proxy.custom_auth_response_size;
            this.socket.write((yield this.options.proxy.custom_auth_request_handler()));
            this.setState(constants_1.SocksClientState.SentAuthentication);
        });
    }
    handleSocks5CustomAuthHandshakeResponse(data) {
        return __awaiter(this, void 0, void 0, function*() {
            return yield this.options.proxy.custom_auth_response_handler(data);
        });
    }
    handleSocks5AuthenticationNoAuthHandshakeResponse(data) {
        return __awaiter(this, void 0, void 0, function*() {
            return data[1] === 0x00;
        });
    }
    handleSocks5AuthenticationUserPassHandshakeResponse(data) {
        return __awaiter(this, void 0, void 0, function*() {
            return data[1] === 0x00;
        });
    }
    /**
     * Handles Socks v5 auth handshake response.
     * @param data
     */ handleInitialSocks5AuthenticationHandshakeResponse() {
        return __awaiter(this, void 0, void 0, function*() {
            this.setState(constants_1.SocksClientState.ReceivedAuthenticationResponse);
            let authResult = false;
            if (this.socks5ChosenAuthType === constants_1.Socks5Auth.NoAuth) {
                authResult = yield this.handleSocks5AuthenticationNoAuthHandshakeResponse(this.receiveBuffer.get(2));
            } else if (this.socks5ChosenAuthType === constants_1.Socks5Auth.UserPass) {
                authResult = yield this.handleSocks5AuthenticationUserPassHandshakeResponse(this.receiveBuffer.get(2));
            } else if (this.socks5ChosenAuthType === this.options.proxy.custom_auth_method) {
                authResult = yield this.handleSocks5CustomAuthHandshakeResponse(this.receiveBuffer.get(this.options.proxy.custom_auth_response_size));
            }
            if (!authResult) {
                this.closeSocket(constants_1.ERRORS.Socks5AuthenticationFailed);
            } else {
                this.sendSocks5CommandRequest();
            }
        });
    }
    /**
     * Sends Socks v5 final handshake request.
     */ sendSocks5CommandRequest() {
        const buff = new smart_buffer_1.SmartBuffer();
        buff.writeUInt8(0x05);
        buff.writeUInt8(constants_1.SocksCommand[this.options.command]);
        buff.writeUInt8(0x00);
        // ipv4, ipv6, domain?
        if (net.isIPv4(this.options.destination.host)) {
            buff.writeUInt8(constants_1.Socks5HostType.IPv4);
            buff.writeBuffer((0, helpers_1.ipToBuffer)(this.options.destination.host));
        } else if (net.isIPv6(this.options.destination.host)) {
            buff.writeUInt8(constants_1.Socks5HostType.IPv6);
            buff.writeBuffer((0, helpers_1.ipToBuffer)(this.options.destination.host));
        } else {
            buff.writeUInt8(constants_1.Socks5HostType.Hostname);
            buff.writeUInt8(this.options.destination.host.length);
            buff.writeString(this.options.destination.host);
        }
        buff.writeUInt16BE(this.options.destination.port);
        this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHeader;
        this.socket.write(buff.toBuffer());
        this.setState(constants_1.SocksClientState.SentFinalHandshake);
    }
    /**
     * Handles Socks v5 final handshake response.
     * @param data
     */ handleSocks5FinalHandshakeResponse() {
        // Peek at available data (we need at least 5 bytes to get the hostname length)
        const header = this.receiveBuffer.peek(5);
        if (header[0] !== 0x05 || header[1] !== constants_1.Socks5Response.Granted) {
            this.closeSocket(`${constants_1.ERRORS.InvalidSocks5FinalHandshakeRejected} - ${constants_1.Socks5Response[header[1]]}`);
        } else {
            // Read address type
            const addressType = header[3];
            let remoteHost;
            let buff;
            // IPv4
            if (addressType === constants_1.Socks5HostType.IPv4) {
                // Check if data is available.
                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv4;
                if (this.receiveBuffer.length < dataNeeded) {
                    this.nextRequiredPacketBufferSize = dataNeeded;
                    return;
                }
                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
                remoteHost = {
                    host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE()),
                    port: buff.readUInt16BE()
                };
                // If given host is 0.0.0.0, assume remote proxy ip instead.
                if (remoteHost.host === '0.0.0.0') {
                    remoteHost.host = this.options.proxy.ipaddress;
                }
            // Hostname
            } else if (addressType === constants_1.Socks5HostType.Hostname) {
                const hostLength = header[4];
                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHostname(hostLength); // header + host length + host + port
                // Check if data is available.
                if (this.receiveBuffer.length < dataNeeded) {
                    this.nextRequiredPacketBufferSize = dataNeeded;
                    return;
                }
                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(5));
                remoteHost = {
                    host: buff.readString(hostLength),
                    port: buff.readUInt16BE()
                };
            // IPv6
            } else if (addressType === constants_1.Socks5HostType.IPv6) {
                // Check if data is available.
                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv6;
                if (this.receiveBuffer.length < dataNeeded) {
                    this.nextRequiredPacketBufferSize = dataNeeded;
                    return;
                }
                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
                remoteHost = {
                    host: ip_address_1.Address6.fromByteArray(Array.from(buff.readBuffer(16))).canonicalForm(),
                    port: buff.readUInt16BE()
                };
            }
            // We have everything we need
            this.setState(constants_1.SocksClientState.ReceivedFinalResponse);
            // If using CONNECT, the client is now in the established state.
            if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.connect) {
                this.setState(constants_1.SocksClientState.Established);
                this.removeInternalSocketHandlers();
                this.emit('established', {
                    remoteHost,
                    socket: this.socket
                });
            } else if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.bind) {
                /* If using BIND, the Socks client is now in BoundWaitingForConnection state.
                   This means that the remote proxy server is waiting for a remote connection to the bound port. */ this.setState(constants_1.SocksClientState.BoundWaitingForConnection);
                this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHeader;
                this.emit('bound', {
                    remoteHost,
                    socket: this.socket
                });
            /*
                  If using Associate, the Socks client is now Established. And the proxy server is now accepting UDP packets at the
                  given bound port. This initial Socks TCP connection must remain open for the UDP relay to continue to work.
                */ } else if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.associate) {
                this.setState(constants_1.SocksClientState.Established);
                this.removeInternalSocketHandlers();
                this.emit('established', {
                    remoteHost,
                    socket: this.socket
                });
            }
        }
    }
    /**
     * Handles Socks v5 incoming connection request (BIND).
     */ handleSocks5IncomingConnectionResponse() {
        // Peek at available data (we need at least 5 bytes to get the hostname length)
        const header = this.receiveBuffer.peek(5);
        if (header[0] !== 0x05 || header[1] !== constants_1.Socks5Response.Granted) {
            this.closeSocket(`${constants_1.ERRORS.Socks5ProxyRejectedIncomingBoundConnection} - ${constants_1.Socks5Response[header[1]]}`);
        } else {
            // Read address type
            const addressType = header[3];
            let remoteHost;
            let buff;
            // IPv4
            if (addressType === constants_1.Socks5HostType.IPv4) {
                // Check if data is available.
                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv4;
                if (this.receiveBuffer.length < dataNeeded) {
                    this.nextRequiredPacketBufferSize = dataNeeded;
                    return;
                }
                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
                remoteHost = {
                    host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE()),
                    port: buff.readUInt16BE()
                };
                // If given host is 0.0.0.0, assume remote proxy ip instead.
                if (remoteHost.host === '0.0.0.0') {
                    remoteHost.host = this.options.proxy.ipaddress;
                }
            // Hostname
            } else if (addressType === constants_1.Socks5HostType.Hostname) {
                const hostLength = header[4];
                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHostname(hostLength); // header + host length + port
                // Check if data is available.
                if (this.receiveBuffer.length < dataNeeded) {
                    this.nextRequiredPacketBufferSize = dataNeeded;
                    return;
                }
                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(5));
                remoteHost = {
                    host: buff.readString(hostLength),
                    port: buff.readUInt16BE()
                };
            // IPv6
            } else if (addressType === constants_1.Socks5HostType.IPv6) {
                // Check if data is available.
                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv6;
                if (this.receiveBuffer.length < dataNeeded) {
                    this.nextRequiredPacketBufferSize = dataNeeded;
                    return;
                }
                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
                remoteHost = {
                    host: ip_address_1.Address6.fromByteArray(Array.from(buff.readBuffer(16))).canonicalForm(),
                    port: buff.readUInt16BE()
                };
            }
            this.setState(constants_1.SocksClientState.Established);
            this.removeInternalSocketHandlers();
            this.emit('established', {
                remoteHost,
                socket: this.socket
            });
        }
    }
    get socksClientOptions() {
        return Object.assign({}, this.options);
    }
}
exports.SocksClient = SocksClient; //# sourceMappingURL=socksclient.js.map
}),
"[project]/node_modules/socks/build/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/socks/build/client/socksclient.js [app-route] (ecmascript)"), exports); //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/ip-address/dist/address-error.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AddressError = void 0;
class AddressError extends Error {
    constructor(message, parseMessage){
        super(message);
        this.name = 'AddressError';
        this.parseMessage = parseMessage;
    }
}
exports.AddressError = AddressError; //# sourceMappingURL=address-error.js.map
}),
"[project]/node_modules/ip-address/dist/common.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isInSubnet = isInSubnet;
exports.isHostInSubnet = isHostInSubnet;
exports.isGloballyReachable = isGloballyReachable;
exports.offsetBigInt = offsetBigInt;
exports.isCorrect = isCorrect;
exports.prefixLengthFromMask = prefixLengthFromMask;
exports.assertByteArray = assertByteArray;
exports.numberToPaddedHex = numberToPaddedHex;
exports.stringToPaddedHex = stringToPaddedHex;
exports.testBit = testBit;
const address_error_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/address-error.js [app-route] (ecmascript)");
/**
 * Returns whether this address's *network* is contained within `address`,
 * i.e. whether every address this one can represent also falls inside
 * `address`. A network wider than `address` is not contained in it, so
 * `10.0.0.0/8` is not in `10.0.0.0/16`.
 *
 * To ask whether the address itself falls inside a range, ignoring any CIDR
 * suffix it was written with, use {@link isHostInSubnet} instead. That is the
 * question the special-use classifiers ask.
 */ function isInSubnet(address) {
    if (this.subnetMask < address.subnetMask) {
        return false;
    }
    return isHostInSubnet.call(this, address);
}
/**
 * Returns whether this address's host bits fall inside `address`, ignoring
 * this address's own subnet mask.
 *
 * This is the primitive the special-use classifiers (`isLoopback`,
 * `isPrivate`, `isLinkLocal`, `getType`, …) are built on: they answer a
 * question about the address, so the answer must not change with the CIDR
 * suffix the caller happened to write. Use this rather than
 * {@link isInSubnet} when classifying a single address — notably when the
 * address came from untrusted input and the result backs a trust-boundary
 * decision such as an SSRF allow/deny filter.
 *
 * An address of one family is never inside a network of the other, so an
 * `Address4` against an `Address6` (or the reverse) is `false`. To compare
 * across families, convert first: `Address6.fromAddress4()`, `to4()`, or
 * `toAddress4Nat64()`.
 */ function isHostInSubnet(address) {
    // mask() is a bit string of the family's width, and the leading bits of a
    // 32-bit string can coincide with those of a 128-bit one (a00::1 and
    // 10.0.0.0/8 both mask to 00001010), so the widths must agree before the
    // strings are compared.
    if (this.binaryZeroPad().length !== address.binaryZeroPad().length) {
        return false;
    }
    return this.mask(address.subnetMask) === address.mask();
}
/**
 * Returns whether the registry marks this address globally reachable: the
 * answer of the most specific entry containing it that has one, or `true`
 * when no entry contains it.
 */ function isGloballyReachable(entries) {
    let best = null;
    for(let i = 0; i < entries.length; i++){
        const entry = entries[i];
        if (entry.reachable !== null && isHostInSubnet.call(this, entry.subnet) && (best === null || entry.subnet.subnetMask > best.subnet.subnetMask)) {
            best = entry;
        }
    }
    return best === null ? true : best.reachable;
}
/**
 * Adds `n` to `value` and returns the result, throwing `AddressError` unless
 * `n` is an integer and the result stays within `[0, 2**bits - 1]`.
 */ function offsetBigInt(value, n, bits, family) {
    if (typeof n === 'number' && !Number.isSafeInteger(n)) {
        throw new address_error_1.AddressError(`${family} offset must be an integer`);
    }
    if (typeof n !== 'number' && typeof n !== 'bigint') {
        throw new address_error_1.AddressError(`${family} offset must be an integer`);
    }
    const result = value + BigInt(n);
    if (result < BigInt(0) || result > (BigInt(1) << BigInt(bits)) - BigInt(1)) {
        throw new address_error_1.AddressError(`${family} offset leaves the address space`);
    }
    return result;
}
function isCorrect(defaultBits) {
    return function isCorrectForm() {
        if (this.addressMinusSuffix !== this.correctForm()) {
            return false;
        }
        if (this.subnetMask === defaultBits && !this.parsedSubnet) {
            return true;
        }
        return this.parsedSubnet === String(this.subnetMask);
    };
}
/**
 * Returns the prefix length (number of leading 1 bits) of a contiguous
 * subnet mask. Throws `AddressError` if the mask is non-contiguous (e.g.
 * `255.0.255.0`).
 */ function prefixLengthFromMask(value, totalBits) {
    const binary = value.toString(2).padStart(totalBits, '0');
    if (binary.length > totalBits) {
        throw new address_error_1.AddressError('Invalid subnet mask.');
    }
    const firstZero = binary.indexOf('0');
    if (firstZero === -1) {
        return totalBits;
    }
    if (binary.slice(firstZero).includes('1')) {
        throw new address_error_1.AddressError('Invalid subnet mask.');
    }
    return firstZero;
}
/**
 * Throws `AddressError` unless `bytes` holds exactly `byteCount` integers,
 * each from `minimum` to 255. Pass a `minimum` of `-128` where signed bytes
 * are accepted and folded to unsigned, and `0` where they are not.
 */ function assertByteArray(bytes, byteCount, family, minimum) {
    if (bytes.length !== byteCount) {
        throw new address_error_1.AddressError(`${family} addresses require exactly ${byteCount} bytes`);
    }
    for(let i = 0; i < bytes.length; i++){
        if (!Number.isInteger(bytes[i]) || bytes[i] < minimum || bytes[i] > 255) {
            throw new address_error_1.AddressError(`All bytes must be integers between ${minimum} and 255`);
        }
    }
}
function numberToPaddedHex(number) {
    return number.toString(16).padStart(2, '0');
}
function stringToPaddedHex(numberString) {
    return numberToPaddedHex(parseInt(numberString, 10));
}
/**
 * @param binaryValue Binary representation of a value (e.g. `10`)
 * @param position Byte position, where 0 is the least significant bit
 */ function testBit(binaryValue, position) {
    const { length } = binaryValue;
    if (position > length) {
        return false;
    }
    const positionInString = length - position;
    return binaryValue.substring(positionInString, positionInString + 1) === '1';
} //# sourceMappingURL=common.js.map
}),
"[project]/node_modules/ip-address/dist/v4/constants.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SPECIAL_PURPOSE = exports.RE_SUBNET_STRING = exports.RE_ADDRESS = exports.GROUPS = exports.BITS = void 0;
exports.BITS = 32;
exports.GROUPS = 4;
// Each octet is 0-255 written without a leading zero. A leading zero is
// octal to the WHATWG URL parser, inet_aton, and getaddrinfo, but decimal to
// parseInt(part, 10), so accepting the notation would make this library
// disagree with the network stack about which host a string names.
exports.RE_ADDRESS = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/g;
exports.RE_SUBNET_STRING = /\/\d{1,2}$/;
/**
 * The IANA IPv4 Special-Purpose Address Registry
 * (https://www.iana.org/assignments/iana-ipv4-special-registry/), one entry
 * per block: `[cidr, name, globallyReachable]`. A `null` reachability means
 * the registry leaves the column blank and the block inherits the answer of
 * the block containing it (or is global when nothing contains it).
 *
 * `Address4.isGlobal()` answers from the most specific entry containing the
 * address. `test/data/iana-corpus.json` is generated from the registry's CSV
 * and pins this table to it.
 */ exports.SPECIAL_PURPOSE = [
    [
        '0.0.0.0/8',
        'This network',
        false
    ],
    [
        '0.0.0.0/32',
        'This host on this network',
        false
    ],
    [
        '10.0.0.0/8',
        'Private-Use',
        false
    ],
    [
        '100.64.0.0/10',
        'Shared Address Space',
        false
    ],
    [
        '127.0.0.0/8',
        'Loopback',
        false
    ],
    [
        '169.254.0.0/16',
        'Link Local',
        false
    ],
    [
        '172.16.0.0/12',
        'Private-Use',
        false
    ],
    [
        '192.0.0.0/24',
        'IETF Protocol Assignments',
        false
    ],
    [
        '192.0.0.0/29',
        'IPv4 Service Continuity Prefix',
        false
    ],
    [
        '192.0.0.8/32',
        'IPv4 dummy address',
        false
    ],
    [
        '192.0.0.9/32',
        'Port Control Protocol Anycast',
        true
    ],
    [
        '192.0.0.10/32',
        'Traversal Using Relays around NAT Anycast',
        true
    ],
    [
        '192.0.0.170/32',
        'NAT64/DNS64 Discovery',
        false
    ],
    [
        '192.0.0.171/32',
        'NAT64/DNS64 Discovery',
        false
    ],
    [
        '192.0.2.0/24',
        'Documentation (TEST-NET-1)',
        false
    ],
    [
        '192.31.196.0/24',
        'AS112-v4',
        true
    ],
    [
        '192.52.193.0/24',
        'AMT',
        true
    ],
    [
        '192.88.99.0/24',
        'Deprecated (6to4 Relay Anycast)',
        null
    ],
    [
        '192.88.99.2/32',
        '6a44-relay anycast address',
        false
    ],
    [
        '192.168.0.0/16',
        'Private-Use',
        false
    ],
    [
        '192.175.48.0/24',
        'Direct Delegation AS112 Service',
        true
    ],
    [
        '198.18.0.0/15',
        'Benchmarking',
        false
    ],
    [
        '198.51.100.0/24',
        'Documentation (TEST-NET-2)',
        false
    ],
    [
        '203.0.113.0/24',
        'Documentation (TEST-NET-3)',
        false
    ],
    [
        '240.0.0.0/4',
        'Reserved',
        false
    ],
    [
        '255.255.255.255/32',
        'Limited Broadcast',
        false
    ]
]; //# sourceMappingURL=constants.js.map
}),
"[project]/node_modules/ip-address/dist/ipv4.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-disable no-param-reassign */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Address4 = void 0;
const common = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/common.js [app-route] (ecmascript)"));
const constants = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/v4/constants.js [app-route] (ecmascript)"));
const address_error_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/address-error.js [app-route] (ecmascript)");
const isCorrect4 = common.isCorrect(constants.BITS);
/**
 * Represents an IPv4 address
 * @param {string} address - An IPv4 address string
 */ class Address4 {
    constructor(address){
        this.addressMinusSuffix = '';
        this.groups = constants.GROUPS;
        this.parsedAddress = [];
        this.parsedSubnet = '';
        this.subnet = '/32';
        this.subnetMask = 32;
        this.v4 = true;
        /**
         * Returns true if the address is correct, false otherwise
         * @returns {Boolean}
         */ this.isCorrect = isCorrect4;
        /**
         * Returns true if the given address is in the subnet of the current address.
         * An `Address6` is never in the subnet of an `Address4`; convert with
         * `to4()` or `Address6.fromAddress4()` to compare across families.
         * @returns {boolean}
         */ this.isInSubnet = common.isInSubnet;
        /**
         * Returns true if this address's host bits fall inside the given subnet,
         * ignoring this address's own subnet mask. Prefer this over `isInSubnet`
         * when classifying a single address, so the answer doesn't change with the
         * CIDR suffix the caller happened to write — notably when the address came
         * from untrusted input and the result backs a trust-boundary decision.
         * An `Address6` is never in the subnet of an `Address4`; convert with
         * `to4()` or `Address6.fromAddress4()` to compare across families.
         * @returns {boolean}
         */ this.isHostInSubnet = common.isHostInSubnet;
        this.address = address;
        const subnet = constants.RE_SUBNET_STRING.exec(address);
        if (subnet) {
            this.parsedSubnet = subnet[0].replace('/', '');
            this.subnetMask = parseInt(this.parsedSubnet, 10);
            this.subnet = `/${this.subnetMask}`;
            if (this.subnetMask < 0 || this.subnetMask > constants.BITS) {
                throw new address_error_1.AddressError('Invalid subnet mask.');
            }
            address = address.replace(constants.RE_SUBNET_STRING, '');
        }
        // Four three-digit octets and three dots: the longest well-formed address
        // is 15 characters. Longer input is rejected before parsing, as Address6
        // does at its own limit.
        const longest = constants.GROUPS * 4 - 1;
        if (address.length > longest) {
            throw new address_error_1.AddressError(`IPv4 addresses are at most ${longest} characters.`);
        }
        this.addressMinusSuffix = address;
        this.parsedAddress = this.parse(address);
    }
    /**
     * Returns true if the given string is a valid IPv4 address (with optional
     * CIDR subnet), false otherwise. Host bits in the subnet portion are
     * allowed (e.g. `192.168.1.5/24` is valid); for strict network-address
     * validation compare `correctForm()` to `startAddress().correctForm()`,
     * or use `networkForm()`.
     */ static isValid(address) {
        try {
            // eslint-disable-next-line no-new
            new Address4(address);
            return true;
        } catch  {
            return false;
        }
    }
    /**
     * Parses an IPv4 address string into its four octet groups and stores the
     * result on `this.parsedAddress`. Called automatically by the constructor;
     * you typically don't need to call it directly. Throws `AddressError` if
     * the input is not a valid IPv4 address.
     */ parse(address) {
        const groups = address.split('.');
        // Checked before the general match so the error names the actual problem.
        // Address6 rejects the same notation on its v4-in-v6 path.
        if (groups.some((group)=>/^0\d/.test(group))) {
            throw new address_error_1.AddressError("IPv4 addresses can't have leading zeroes.");
        }
        if (!address.match(constants.RE_ADDRESS)) {
            throw new address_error_1.AddressError('Invalid IPv4 address.');
        }
        return groups;
    }
    /**
     * Returns the address in correct form: octets joined with `.` and any
     * leading zeros stripped (e.g. `192.168.1.1`). For IPv4 this matches the
     * canonical dotted-decimal representation.
     */ correctForm() {
        return this.parsedAddress.map((part)=>parseInt(part, 10)).join('.');
    }
    /**
     * Construct an `Address4` from an address and a dotted-decimal subnet
     * mask given as separate strings (e.g. as returned by Node's
     * `os.networkInterfaces()`). Throws `AddressError` if the mask is
     * non-contiguous (e.g. `255.0.255.0`).
     * @example
     * var address = Address4.fromAddressAndMask('192.168.1.1', '255.255.255.0');
     * address.subnetMask; // 24
     */ static fromAddressAndMask(address, mask) {
        const bits = common.prefixLengthFromMask(new Address4(mask).bigInt(), constants.BITS);
        return new Address4(`${address}/${bits}`);
    }
    /**
     * Construct an `Address4` from an address and a Cisco-style wildcard mask
     * given as separate strings (e.g. `0.0.0.255` for a `/24`). The wildcard
     * mask is the bitwise inverse of the subnet mask. Throws `AddressError`
     * if the mask is non-contiguous (e.g. `0.255.0.255`).
     * @example
     * var address = Address4.fromAddressAndWildcardMask('10.0.0.1', '0.0.0.255');
     * address.subnetMask; // 24
     */ static fromAddressAndWildcardMask(address, wildcardMask) {
        const wildcard = new Address4(wildcardMask).bigInt();
        const allOnes = (BigInt(1) << BigInt(constants.BITS)) - BigInt(1);
        const mask = wildcard ^ allOnes;
        const bits = common.prefixLengthFromMask(mask, constants.BITS);
        return new Address4(`${address}/${bits}`);
    }
    /**
     * Construct an `Address4` from a wildcard pattern with trailing `*`
     * octets. The number of trailing wildcards determines the prefix
     * length: each `*` represents 8 bits.
     *
     * Only trailing whole-octet wildcards are supported. Partial-octet
     * wildcards (e.g. `192.168.0.1*`) and interior wildcards (e.g.
     * `192.*.0.1`) throw `AddressError`.
     * @example
     * Address4.fromWildcard('192.168.0.*').subnet;   // '/24'
     * Address4.fromWildcard('192.168.*.*').subnet;   // '/16'
     * Address4.fromWildcard('*.*.*.*').subnet;       // '/0'
     */ static fromWildcard(input) {
        const groups = input.split('.');
        if (groups.length !== constants.GROUPS) {
            throw new address_error_1.AddressError('Wildcard pattern must have 4 octets');
        }
        let firstWildcard = -1;
        for(let i = 0; i < groups.length; i++){
            if (groups[i] === '*') {
                if (firstWildcard === -1) {
                    firstWildcard = i;
                }
            } else if (firstWildcard !== -1) {
                throw new address_error_1.AddressError('Wildcard `*` must only appear in trailing octets (e.g. `192.168.0.*`)');
            }
        }
        const trailing = firstWildcard === -1 ? 0 : groups.length - firstWildcard;
        const replaced = groups.map((g)=>g === '*' ? '0' : g);
        const subnetBits = constants.BITS - trailing * 8;
        return new Address4(`${replaced.join('.')}/${subnetBits}`);
    }
    /**
     * Converts a hex string to an IPv4 address object. Accepts 8 hex digits
     * with optional `:` separators (e.g. `'7f000001'` or `'7f:00:00:01'`).
     * Throws `AddressError` for any other length or for non-hex characters.
     * @param {string} hex - a hex string to convert
     * @returns {Address4}
     */ static fromHex(hex) {
        const stripped = hex.replace(/:/g, '');
        if (!/^[0-9a-fA-F]{8}$/.test(stripped)) {
            throw new address_error_1.AddressError('IPv4 hex must be exactly 8 hex digits');
        }
        const groups = [];
        for(let i = 0; i < 8; i += 2){
            groups.push(parseInt(stripped.slice(i, i + 2), 16));
        }
        return new Address4(groups.join('.'));
    }
    /**
     * Converts an integer into a IPv4 address object. The integer must be a
     * non-negative safe integer in the range `[0, 2**32 - 1]`; otherwise
     * `AddressError` is thrown.
     * @param {integer} integer - a number to convert
     * @returns {Address4}
     */ static fromInteger(integer) {
        if (!Number.isInteger(integer) || integer < 0 || integer > 0xffffffff) {
            throw new address_error_1.AddressError('IPv4 integer must be in the range 0 to 2**32 - 1');
        }
        return Address4.fromHex(integer.toString(16).padStart(8, '0'));
    }
    /**
     * Return an address from in-addr.arpa form: the four octets reversed, with
     * or without the `.in-addr.arpa` suffix and root dot, in any case. Throws
     * `AddressError` unless the reversed labels form a valid IPv4 address, so
     * `fromArpa(x.reverseForm())` round-trips {@link reverseForm}.
     * @param {string} arpaFormAddress - an 'in-addr.arpa' form ipv4 address
     * @returns {Adress4}
     * @example
     * var address = Address4.fromArpa('42.2.0.192.in-addr.arpa.')
     * address.correctForm(); // '192.0.2.42'
     */ static fromArpa(arpaFormAddress) {
        // remove an ending ".in-addr.arpa", in any case and with or without the
        // root dot, as Address6.fromArpa does for ".ip6.arpa"
        const leader = arpaFormAddress.replace(/(\.in-addr\.arpa)?\.?$/i, '');
        const address = leader.split('.').reverse().join('.');
        return new Address4(address);
    }
    /**
     * Converts an IPv4 address object to a hex string
     * @returns {String}
     */ toHex() {
        return this.parsedAddress.map((part)=>common.stringToPaddedHex(part)).join(':');
    }
    /**
     * Converts an IPv4 address object to an array of bytes.
     *
     * To get a Node.js `Buffer`, wrap the result: `Buffer.from(address.toArray())`.
     * @returns {Array}
     */ toArray() {
        return this.parsedAddress.map((part)=>parseInt(part, 10));
    }
    /**
     * Converts an IPv4 address object to an IPv6 address group
     * @returns {String}
     */ toGroup6() {
        const output = [];
        let i;
        for(i = 0; i < constants.GROUPS; i += 2){
            output.push(`${common.stringToPaddedHex(this.parsedAddress[i])}${common.stringToPaddedHex(this.parsedAddress[i + 1])}`);
        }
        return output.join(':');
    }
    /**
     * Returns the address as a `bigint`
     * @returns {bigint}
     */ bigInt() {
        return BigInt(`0x${this.parsedAddress.map((n)=>common.stringToPaddedHex(n)).join('')}`);
    }
    /**
     * Helper function getting start address.
     * @returns {bigint}
     */ _startAddress() {
        return BigInt(`0b${this.mask() + '0'.repeat(constants.BITS - this.subnetMask)}`);
    }
    /**
     * The first address in the range given by this address' subnet.
     * Often referred to as the Network Address.
     * @returns {Address4}
     */ startAddress() {
        return Address4.fromBigInt(this._startAddress());
    }
    /**
     * The first host address in the range given by this address's subnet ie
     * the first address after the Network Address
     * @returns {Address4}
     */ startAddressExclusive() {
        const adjust = BigInt('1');
        return Address4.fromBigInt(this._startAddress() + adjust);
    }
    /**
     * Returns the address `n` addresses after this one (or before, when `n` is
     * negative), keeping this address's subnet mask. Throws `AddressError` when
     * the result would fall outside the IPv4 address space or `n` is not an
     * integer.
     * @param {number | bigint} n
     * @returns {Address4}
     * @example
     * new Address4('10.0.0.0/24').offset(1).correctForm(); // '10.0.0.1'
     */ offset(n) {
        return Address4.fromBigInt(common.offsetBigInt(this.bigInt(), n, constants.BITS, 'IPv4')).withSubnetMask(this.subnetMask);
    }
    /**
     * Returns the network that follows this address's network: the address after
     * {@link endAddress}, with the same subnet mask. Throws `AddressError` when
     * this network is the last one in the address space.
     * @returns {Address4}
     * @example
     * new Address4('10.0.0.0/24').nextNetwork().networkForm(); // '10.0.1.0/24'
     */ nextNetwork() {
        return Address4.fromBigInt(common.offsetBigInt(this._endAddress(), 1, constants.BITS, 'IPv4')).withSubnetMask(this.subnetMask);
    }
    withSubnetMask(subnetMask) {
        return new Address4(`${this.correctForm()}/${subnetMask}`);
    }
    /**
     * Helper function getting end address.
     * @returns {bigint}
     */ _endAddress() {
        return BigInt(`0b${this.mask() + '1'.repeat(constants.BITS - this.subnetMask)}`);
    }
    /**
     * The last address in the range given by this address' subnet
     * Often referred to as the Broadcast
     * @returns {Address4}
     */ endAddress() {
        return Address4.fromBigInt(this._endAddress());
    }
    /**
     * The last host address in the range given by this address's subnet ie
     * the last address prior to the Broadcast Address
     * @returns {Address4}
     */ endAddressExclusive() {
        const adjust = BigInt('1');
        return Address4.fromBigInt(this._endAddress() - adjust);
    }
    /**
     * The dotted-decimal form of the subnet mask, e.g. `255.255.240.0` for
     * a `/20`. Returns an `Address4`; call `.correctForm()` for the string.
     * @returns {Address4}
     */ subnetMaskAddress() {
        return Address4.fromBigInt(BigInt(`0b${'1'.repeat(this.subnetMask)}${'0'.repeat(constants.BITS - this.subnetMask)}`));
    }
    /**
     * The Cisco-style wildcard mask, e.g. `0.0.0.255` for a `/24`. This is
     * the bitwise inverse of `subnetMaskAddress()`. Returns an `Address4`;
     * call `.correctForm()` for the string.
     * @returns {Address4}
     */ wildcardMask() {
        return Address4.fromBigInt(BigInt(`0b${'0'.repeat(this.subnetMask)}${'1'.repeat(constants.BITS - this.subnetMask)}`));
    }
    /**
     * The network address in CIDR string form, e.g. `192.168.1.0/24` for
     * `192.168.1.5/24`. For an address with no explicit subnet the prefix is
     * `/32`, e.g. `networkForm()` on `192.168.1.5` returns `192.168.1.5/32`.
     * @returns {string}
     */ networkForm() {
        return `${this.startAddress().correctForm()}/${this.subnetMask}`;
    }
    /**
     * Converts a BigInt to a v4 address object. The value must be in the
     * range `[0, 2**32 - 1]`; otherwise `AddressError` is thrown.
     * @param {bigint} bigInt - a BigInt to convert
     * @returns {Address4}
     */ static fromBigInt(bigInt) {
        if (bigInt < BigInt(0) || bigInt > BigInt(0xffffffff)) {
            throw new address_error_1.AddressError('IPv4 BigInt must be in the range 0 to 2**32 - 1');
        }
        return Address4.fromHex(bigInt.toString(16).padStart(8, '0'));
    }
    /**
     * Convert a byte array to an Address4 object. Throws `AddressError` unless
     * given exactly 4 integers from 0 to 255. Signed bytes are rejected, so
     * this differs from `Address6.fromByteArray`, which folds them; the two
     * contracts converge on this stricter form in the next major version.
     *
     * To convert from a Node.js `Buffer`, spread it: `Address4.fromByteArray([...buf])`.
     * @param {Array<number>} bytes - an array of 4 bytes (0-255)
     * @returns {Address4}
     */ static fromByteArray(bytes) {
        common.assertByteArray(bytes, 4, 'IPv4', 0);
        return this.fromUnsignedByteArray(bytes);
    }
    /**
     * Convert an unsigned byte array to an Address4 object. Throws
     * `AddressError` unless given exactly 4 bytes, and rejects values outside
     * 0 to 255 when parsing the resulting address.
     *
     * To convert from a Node.js `Buffer`, spread it:
     * `Address4.fromUnsignedByteArray([...buf])`.
     * @param {Array<number>} bytes - an array of 4 unsigned bytes (0-255)
     * @returns {Address4}
     */ static fromUnsignedByteArray(bytes) {
        if (bytes.length !== 4) {
            throw new address_error_1.AddressError('IPv4 addresses require exactly 4 bytes');
        }
        const address = bytes.join('.');
        return new Address4(address);
    }
    /**
     * Returns the first n bits of the address, defaulting to the
     * subnet mask
     * @returns {String}
     */ mask(mask) {
        if (mask === undefined) {
            mask = this.subnetMask;
        }
        return this.getBitsBase2(0, mask);
    }
    /**
     * Returns the bits in the given range as a base-2 string
     * @returns {string}
     */ getBitsBase2(start, end) {
        return this.binaryZeroPad().slice(start, end);
    }
    /**
     * Return the reversed in-addr.arpa form of the address, e.g.
     * `42.2.0.192.in-addr.arpa.` for `192.0.2.42`.
     * @param {Object} options
     * @param {boolean} options.omitSuffix - omit the "in-addr.arpa" suffix
     * @returns {String}
     */ reverseForm(options) {
        if (!options) {
            options = {};
        }
        const reversed = this.correctForm().split('.').reverse().join('.');
        if (options.omitSuffix) {
            return reversed;
        }
        return `${reversed}.in-addr.arpa.`;
    }
    /**
     * Returns true if the given address is a multicast address
     * @returns {boolean}
     */ isMulticast() {
        return this.isHostInSubnet(MULTICAST_V4);
    }
    /**
     * Returns true if the address is in one of the [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) private address ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
     * @returns {boolean}
     */ isPrivate() {
        return PRIVATE_V4.some((subnet)=>this.isHostInSubnet(subnet));
    }
    /**
     * Returns true if the address is in the loopback range `127.0.0.0/8` ([RFC 1122](https://datatracker.ietf.org/doc/html/rfc1122)).
     * @returns {boolean}
     */ isLoopback() {
        return this.isHostInSubnet(LOOPBACK_V4);
    }
    /**
     * Returns true if the address is in the link-local range `169.254.0.0/16` ([RFC 3927](https://datatracker.ietf.org/doc/html/rfc3927)).
     * @returns {boolean}
     */ isLinkLocal() {
        return this.isHostInSubnet(LINK_LOCAL_V4);
    }
    /**
     * Returns true if the address is the unspecified address `0.0.0.0`.
     * @returns {boolean}
     */ isUnspecified() {
        return this.isHostInSubnet(UNSPECIFIED_V4);
    }
    /**
     * Returns true if the address is the limited broadcast address `255.255.255.255` ([RFC 919](https://datatracker.ietf.org/doc/html/rfc919)).
     * @returns {boolean}
     */ isBroadcast() {
        return this.isHostInSubnet(BROADCAST_V4);
    }
    /**
     * Returns true if the address is in the carrier-grade NAT range `100.64.0.0/10` ([RFC 6598](https://datatracker.ietf.org/doc/html/rfc6598)).
     * @returns {boolean}
     */ isCGNAT() {
        return this.isHostInSubnet(CGNAT_V4);
    }
    /**
     * Returns true if the address is in one of the documentation ranges
     * `192.0.2.0/24`, `198.51.100.0/24`, or `203.0.113.0/24` ([RFC 5737](https://datatracker.ietf.org/doc/html/rfc5737)).
     * @returns {boolean}
     */ isDocumentation() {
        return DOCUMENTATION_V4.some((subnet)=>this.isHostInSubnet(subnet));
    }
    /**
     * Returns true if the address is in the benchmarking range `198.18.0.0/15` ([RFC 2544](https://datatracker.ietf.org/doc/html/rfc2544)).
     * @returns {boolean}
     */ isBenchmarking() {
        return this.isHostInSubnet(BENCHMARKING_V4);
    }
    /**
     * Returns true if the address is in the reserved range `240.0.0.0/4` ([RFC 1112](https://datatracker.ietf.org/doc/html/rfc1112)),
     * which includes the limited broadcast address.
     * @returns {boolean}
     */ isReserved() {
        return this.isHostInSubnet(RESERVED_V4);
    }
    /**
     * Returns true if the address is globally reachable: not multicast, and not
     * in any block the [IANA IPv4 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv4-special-registry/)
     * marks as not globally reachable. That covers everything the individual
     * classifiers name (private, loopback, link-local, CGNAT, unspecified,
     * broadcast, documentation, benchmarking, reserved) and the blocks they do
     * not, such as `0.0.0.0/8` and the IETF protocol assignments in
     * `192.0.0.0/24`. This is the single predicate to use where a request must
     * not reach an internal or special-purpose destination; see SECURITY.md.
     * @returns {boolean}
     */ isGlobal() {
        return !this.isMulticast() && common.isGloballyReachable.call(this, SPECIAL_PURPOSE_V4);
    }
    /**
     * Returns a zero-padded base-2 string representation of the address
     * @returns {string}
     */ binaryZeroPad() {
        if (this._binaryZeroPad === undefined) {
            this._binaryZeroPad = this.bigInt().toString(2).padStart(constants.BITS, '0');
        }
        return this._binaryZeroPad;
    }
    /**
     * Groups an IPv4 address for inclusion at the end of an IPv6 address.
     *
     * Returns an HTML fragment: each half of the address is wrapped in a
     * `<span>` carrying the group classes an address-inspector UI hovers on.
     * The address content is HTML-escaped; anything you concatenate around it
     * is your responsibility.
     * @returns {String}
     */ groupForV6() {
        const segments = this.parsedAddress;
        return this.correctForm().replace(constants.RE_ADDRESS, `<span class="hover-group group-v4 group-6">${segments.slice(0, 2).join('.')}</span>.<span class="hover-group group-v4 group-7">${segments.slice(2, 4).join('.')}</span>`);
    }
}
exports.Address4 = Address4;
const MULTICAST_V4 = new Address4('224.0.0.0/4');
const PRIVATE_V4 = [
    new Address4('10.0.0.0/8'),
    new Address4('172.16.0.0/12'),
    new Address4('192.168.0.0/16')
];
const LOOPBACK_V4 = new Address4('127.0.0.0/8');
const LINK_LOCAL_V4 = new Address4('169.254.0.0/16');
const UNSPECIFIED_V4 = new Address4('0.0.0.0/32');
const BROADCAST_V4 = new Address4('255.255.255.255/32');
const CGNAT_V4 = new Address4('100.64.0.0/10');
const DOCUMENTATION_V4 = [
    new Address4('192.0.2.0/24'),
    new Address4('198.51.100.0/24'),
    new Address4('203.0.113.0/24')
];
const BENCHMARKING_V4 = new Address4('198.18.0.0/15');
const RESERVED_V4 = new Address4('240.0.0.0/4');
const SPECIAL_PURPOSE_V4 = constants.SPECIAL_PURPOSE.map(([cidr, , reachable])=>({
        subnet: new Address4(cidr),
        reachable
    })); //# sourceMappingURL=ipv4.js.map
}),
"[project]/node_modules/ip-address/dist/v6/constants.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SPECIAL_PURPOSE = exports.RE_URL_WITH_PORT = exports.RE_URL = exports.RE_ZONE_STRING = exports.RE_SUBNET_STRING = exports.RE_BAD_ADDRESS = exports.RE_BAD_CHARACTERS = exports.TYPES = exports.SCOPES = exports.GROUPS = exports.BITS = void 0;
exports.BITS = 128;
exports.GROUPS = 8;
/**
 * Represents IPv6 address scopes
 * @memberof Address6
 * @static
 */ exports.SCOPES = {
    0: 'Reserved',
    1: 'Interface local',
    2: 'Link local',
    4: 'Admin local',
    5: 'Site local',
    8: 'Organization local',
    14: 'Global',
    15: 'Reserved'
};
/**
 * Represents IPv6 address types
 * @memberof Address6
 * @static
 */ exports.TYPES = {
    'ff01::1/128': 'Multicast (All nodes on this interface)',
    'ff01::2/128': 'Multicast (All routers on this interface)',
    'ff02::1/128': 'Multicast (All nodes on this link)',
    'ff02::2/128': 'Multicast (All routers on this link)',
    'ff05::2/128': 'Multicast (All routers in this site)',
    'ff02::5/128': 'Multicast (OSPFv3 AllSPF routers)',
    'ff02::6/128': 'Multicast (OSPFv3 AllDR routers)',
    'ff02::9/128': 'Multicast (RIP routers)',
    'ff02::a/128': 'Multicast (EIGRP routers)',
    'ff02::d/128': 'Multicast (PIM routers)',
    'ff02::16/128': 'Multicast (MLDv2 reports)',
    'ff01::fb/128': 'Multicast (mDNSv6)',
    'ff02::fb/128': 'Multicast (mDNSv6)',
    'ff05::fb/128': 'Multicast (mDNSv6)',
    'ff02::1:2/128': 'Multicast (All DHCP servers and relay agents on this link)',
    'ff05::1:2/128': 'Multicast (All DHCP servers and relay agents in this site)',
    'ff02::1:3/128': 'Multicast (All DHCP servers on this link)',
    'ff05::1:3/128': 'Multicast (All DHCP servers in this site)',
    '::/128': 'Unspecified',
    '::1/128': 'Loopback',
    '::ffff:0:0/96': 'IPv4-mapped',
    'ff00::/8': 'Multicast',
    'fe80::/10': 'Link-local unicast',
    'fc00::/7': 'Unique local',
    '2001::/32': 'Teredo',
    '2001:2::/48': 'Benchmarking',
    '2002::/16': '6to4',
    '2001:db8::/32': 'Documentation',
    '3fff::/20': 'Documentation',
    '100::/64': 'Discard-only',
    'fec0::/10': 'Site-local unicast (deprecated)',
    '::/96': 'IPv4-compatible (deprecated)',
    '64:ff9b::/96': 'NAT64 (well-known)',
    '64:ff9b:1::/48': 'NAT64 (local-use)'
};
/**
 * A regular expression that matches bad characters in an IPv6 address
 * @memberof Address6
 * @static
 */ exports.RE_BAD_CHARACTERS = /([^0-9a-f:/%])/gi;
/**
 * A regular expression that matches an incorrect IPv6 address
 * @memberof Address6
 * @static
 */ exports.RE_BAD_ADDRESS = /([0-9a-f]{5,}|:{3,}|[^:]:$|^:[^:]|\/$)/gi;
/**
 * A regular expression that matches an IPv6 subnet
 * @memberof Address6
 * @static
 */ exports.RE_SUBNET_STRING = /\/\d{1,3}(?=%|$)/;
/**
 * A regular expression that matches an IPv6 zone
 * @memberof Address6
 * @static
 */ exports.RE_ZONE_STRING = /%.*$/;
exports.RE_URL = /^(?:\[([0-9a-f:.]+)\]|([0-9a-f:.]+))(?:[/?#].*)?$/i;
exports.RE_URL_WITH_PORT = /^\[([0-9a-f:.]+)\]:([0-9]{1,5})(?:[/?#].*)?$/i;
/**
 * The IANA IPv6 Special-Purpose Address Registry
 * (https://www.iana.org/assignments/iana-ipv6-special-registry/), one entry
 * per block: `[cidr, name, globallyReachable]`. A `null` reachability means
 * the registry says N/A or leaves the column blank; N/A blocks (Teredo, 6to4)
 * are treated as not globally reachable, since a packet to one needs a relay,
 * and blank blocks inherit the answer of the block containing them.
 *
 * `Address6.isGlobal()` answers from the most specific entry containing the
 * address, after delegating IPv4-mapped and NAT64 well-known addresses to the
 * embedded IPv4 address. `test/data/iana-corpus.json` is generated from the
 * registry's CSV and pins this table to it.
 */ exports.SPECIAL_PURPOSE = [
    [
        '::1/128',
        'Loopback Address',
        false
    ],
    [
        '::/128',
        'Unspecified Address',
        false
    ],
    [
        '::ffff:0:0/96',
        'IPv4-mapped Address',
        false
    ],
    [
        '64:ff9b::/96',
        'IPv4-IPv6 Translat.',
        true
    ],
    [
        '64:ff9b:1::/48',
        'IPv4-IPv6 Translat.',
        false
    ],
    [
        '100::/64',
        'Discard-Only Address Block',
        false
    ],
    [
        '100:0:0:1::/64',
        'Dummy IPv6 Prefix',
        false
    ],
    [
        '2001::/23',
        'IETF Protocol Assignments',
        false
    ],
    [
        '2001::/32',
        'TEREDO',
        false
    ],
    [
        '2001:1::1/128',
        'Port Control Protocol Anycast',
        true
    ],
    [
        '2001:1::2/128',
        'Traversal Using Relays around NAT Anycast',
        true
    ],
    [
        '2001:1::3/128',
        'DNS-SD Service Registration Protocol Anycast',
        true
    ],
    [
        '2001:2::/48',
        'Benchmarking',
        false
    ],
    [
        '2001:3::/32',
        'AMT',
        true
    ],
    [
        '2001:4:112::/48',
        'AS112-v6',
        true
    ],
    [
        '2001:10::/28',
        'Deprecated (previously ORCHID)',
        null
    ],
    [
        '2001:20::/28',
        'ORCHIDv2',
        true
    ],
    [
        '2001:30::/28',
        'Drone Remote ID Protocol Entity Tags (DETs) Prefix',
        true
    ],
    [
        '2001:db8::/32',
        'Documentation',
        false
    ],
    [
        '2002::/16',
        '6to4',
        false
    ],
    [
        '2620:4f:8000::/48',
        'Direct Delegation AS112 Service',
        true
    ],
    [
        '3fff::/20',
        'Documentation',
        false
    ],
    [
        '5f00::/16',
        'Segment Routing (SRv6) SIDs',
        false
    ],
    [
        'fc00::/7',
        'Unique-Local',
        false
    ],
    [
        'fe80::/10',
        'Link-Local Unicast',
        false
    ]
]; //# sourceMappingURL=constants.js.map
}),
"[project]/node_modules/ip-address/dist/v6/helpers.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.escapeHtml = escapeHtml;
exports.spanAllZeroes = spanAllZeroes;
exports.spanAll = spanAll;
exports.spanLeadingZeroes = spanLeadingZeroes;
exports.simpleGroup = simpleGroup;
function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
/**
 * @returns {String} the string with all zeroes contained in a <span>
 */ function spanAllZeroes(s) {
    return escapeHtml(s).replace(/(0+)/g, '<span class="zero">$1</span>');
}
/**
 * @returns {String} the string with each character contained in a <span>
 */ function spanAll(s, offset = 0) {
    const letters = s.split('');
    return letters.map((n, i)=>`<span class="digit value-${escapeHtml(n)} position-${i + offset}">${spanAllZeroes(n)}</span>`).join('');
}
function spanLeadingZeroesSimple(group) {
    return escapeHtml(group).replace(/^(0+)/, '<span class="zero">$1</span>');
}
/**
 * @returns {String} the string with leading zeroes contained in a <span>
 */ function spanLeadingZeroes(address) {
    const groups = address.split(':');
    return groups.map((g)=>spanLeadingZeroesSimple(g)).join(':');
}
/**
 * Groups an address
 * @returns {String} a grouped address
 */ function simpleGroup(addressString, offset = 0) {
    const groups = addressString.split(':');
    return groups.map((g, i)=>{
        if (/group-v4/.test(g)) {
            return g;
        }
        return `<span class="hover-group group-${i + offset}">${spanLeadingZeroesSimple(g)}</span>`;
    });
} //# sourceMappingURL=helpers.js.map
}),
"[project]/node_modules/ip-address/dist/v6/regular-expressions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ADDRESS_BOUNDARY = void 0;
exports.groupPossibilities = groupPossibilities;
exports.padGroup = padGroup;
exports.simpleRegularExpression = simpleRegularExpression;
exports.possibleElisions = possibleElisions;
const v6 = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/v6/constants.js [app-route] (ecmascript)"));
function groupPossibilities(possibilities) {
    return `(${possibilities.join('|')})`;
}
function padGroup(group) {
    if (group.length < 4) {
        return `0{0,${4 - group.length}}${group}`;
    }
    return group;
}
exports.ADDRESS_BOUNDARY = '[^A-Fa-f0-9:]';
function simpleRegularExpression(groups) {
    const zeroIndexes = [];
    groups.forEach((group, i)=>{
        const groupInteger = parseInt(group, 16);
        if (groupInteger === 0) {
            zeroIndexes.push(i);
        }
    });
    // You can technically elide a single 0, this creates the regular expressions
    // to match that eventuality
    const possibilities = zeroIndexes.map((zeroIndex)=>groups.map((group, i)=>{
            if (i === zeroIndex) {
                const elision = i === 0 || i === v6.GROUPS - 1 ? ':' : '';
                return groupPossibilities([
                    padGroup(group),
                    elision
                ]);
            }
            return padGroup(group);
        }).join(':'));
    // The simplest case
    possibilities.push(groups.map(padGroup).join(':'));
    return groupPossibilities(possibilities);
}
function possibleElisions(elidedGroups, moreLeft, moreRight) {
    const left = moreLeft ? '' : ':';
    const right = moreRight ? '' : ':';
    const possibilities = [];
    // 1. elision of everything (::)
    if (!moreLeft && !moreRight) {
        possibilities.push('::');
    }
    // 2. complete elision of the middle
    if (moreLeft && moreRight) {
        possibilities.push('');
    }
    if (moreRight && !moreLeft || !moreRight && moreLeft) {
        // 3. complete elision of one side
        possibilities.push(':');
    }
    // 4. elision from the left side
    possibilities.push(`${left}(:0{1,4}){1,${elidedGroups - 1}}`);
    // 5. elision from the right side
    possibilities.push(`(0{1,4}:){1,${elidedGroups - 1}}${right}`);
    // 6. no elision
    possibilities.push(`(0{1,4}:){${elidedGroups - 1}}0{1,4}`);
    // 7. elision (including sloppy elision) from the middle
    for(let groups = 1; groups < elidedGroups - 1; groups++){
        for(let position = 1; position < elidedGroups - groups; position++){
            possibilities.push(`(0{1,4}:){${position}}:(0{1,4}:){${elidedGroups - position - groups - 1}}0{1,4}`);
        }
    }
    return groupPossibilities(possibilities);
} //# sourceMappingURL=regular-expressions.js.map
}),
"[project]/node_modules/ip-address/dist/ipv6.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-disable prefer-destructuring */ /* eslint-disable no-param-reassign */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Address6 = void 0;
const common = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/common.js [app-route] (ecmascript)"));
const constants4 = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/v4/constants.js [app-route] (ecmascript)"));
const constants6 = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/v6/constants.js [app-route] (ecmascript)"));
const helpers = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/v6/helpers.js [app-route] (ecmascript)"));
const ipv4_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/ipv4.js [app-route] (ecmascript)");
const regular_expressions_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/v6/regular-expressions.js [app-route] (ecmascript)");
const address_error_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/address-error.js [app-route] (ecmascript)");
const common_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/common.js [app-route] (ecmascript)");
const isCorrect6 = common.isCorrect(constants6.BITS);
function assert(condition) {
    if (!condition) {
        throw new Error('Assertion failed.');
    }
}
function addCommas(number) {
    const r = /(\d+)(\d{3})/;
    while(r.test(number)){
        number = number.replace(r, '$1,$2');
    }
    return number;
}
function spanLeadingZeroes4(n) {
    n = n.replace(/^(0{1,})([1-9]+)$/, '<span class="parse-error">$1</span>$2');
    n = n.replace(/^(0{1,})(0)$/, '<span class="parse-error">$1</span>$2');
    return n;
}
/*
 * A helper function to compact an array
 */ function compact(address, slice) {
    const s1 = [];
    const s2 = [];
    let i;
    for(i = 0; i < address.length; i++){
        if (i < slice[0]) {
            s1.push(address[i]);
        } else if (i > slice[1]) {
            s2.push(address[i]);
        }
    }
    return s1.concat([
        'compact'
    ]).concat(s2);
}
function paddedHex(octet) {
    return parseInt(octet, 16).toString(16).padStart(4, '0');
}
function unsignByte(b) {
    return b & 0xff;
}
/**
 * Represents an IPv6 address
 * @param {string} address - An IPv6 address string
 * @param {number} [groups=8] - How many octets to parse
 * @example
 * var address = new Address6('2001::/32');
 */ class Address6 {
    constructor(address, optionalGroups){
        this.addressMinusSuffix = '';
        this.parsedSubnet = '';
        this.subnet = '/128';
        this.subnetMask = 128;
        this.v4 = false;
        this.zone = '';
        // #region Attributes
        /**
         * Returns true if the given address is in the subnet of the current address.
         * An `Address4` is never in the subnet of an `Address6`; convert with
         * `Address6.fromAddress4()` or `to4()` to compare across families.
         * @returns {boolean}
         */ this.isInSubnet = common.isInSubnet;
        /**
         * Returns true if this address's host bits fall inside the given subnet,
         * ignoring this address's own subnet mask. Prefer this over `isInSubnet`
         * when classifying a single address, so the answer doesn't change with the
         * CIDR suffix the caller happened to write — notably when the address came
         * from untrusted input and the result backs a trust-boundary decision.
         * An `Address4` is never in the subnet of an `Address6`; convert with
         * `Address6.fromAddress4()` or `to4()` to compare across families.
         * @returns {boolean}
         */ this.isHostInSubnet = common.isHostInSubnet;
        /**
         * Returns true if the address is correct, false otherwise
         * @returns {boolean}
         */ this.isCorrect = isCorrect6;
        if (optionalGroups === undefined) {
            this.groups = constants6.GROUPS;
        } else {
            this.groups = optionalGroups;
        }
        this.address = address;
        const subnet = constants6.RE_SUBNET_STRING.exec(address);
        if (subnet) {
            this.parsedSubnet = subnet[0].replace('/', '');
            this.subnetMask = parseInt(this.parsedSubnet, 10);
            this.subnet = `/${this.subnetMask}`;
            if (Number.isNaN(this.subnetMask) || this.subnetMask < 0 || this.subnetMask > constants6.BITS) {
                throw new address_error_1.AddressError('Invalid subnet mask.');
            }
            address = address.replace(constants6.RE_SUBNET_STRING, '');
        }
        // RE_SUBNET_STRING anchors on the end of the address, so it strips only
        // the trailing suffix. A second one left behind (`::/0/1`) is malformed
        // and must be rejected rather than parsed as an address group.
        if (/\//.test(address)) {
            throw new address_error_1.AddressError('Invalid subnet mask.');
        }
        const zone = constants6.RE_ZONE_STRING.exec(address);
        if (zone) {
            this.zone = zone[0];
            address = address.replace(constants6.RE_ZONE_STRING, '');
        }
        // The longest well-formed address is all but the last two groups written
        // as four hex digits with their colons, then a 15-character dotted quad:
        // 5 * (groups - 2) + 15, which is 45 for eight groups, the same line
        // CPython's ipaddress module draws. Rejecting longer input here keeps the
        // parse diagnostics, which wrap every offending character in a span,
        // proportional to an address rather than to whatever was passed in.
        const longest = this.groups * 5 + 5;
        if (address.length > longest) {
            throw new address_error_1.AddressError(`IPv6 addresses are at most ${longest} characters.`);
        }
        this.addressMinusSuffix = address;
        this.parsedAddress = this.parse(this.addressMinusSuffix);
    }
    /**
     * Returns true if the given string is a valid IPv6 address (with optional
     * CIDR subnet and zone identifier), false otherwise. Host bits in the
     * subnet portion are allowed (e.g. `2001:db8::1/32` is valid); for strict
     * network-address validation compare `correctForm()` to
     * `startAddress().correctForm()`, or use `networkForm()`.
     */ static isValid(address) {
        try {
            // eslint-disable-next-line no-new
            new Address6(address);
            return true;
        } catch  {
            return false;
        }
    }
    /**
     * Convert a BigInt to a v6 address object. The value must be in the
     * range `[0, 2**128 - 1]`; otherwise `AddressError` is thrown.
     * @param {bigint} bigInt - a BigInt to convert
     * @returns {Address6}
     * @example
     * var bigInt = BigInt('1000000000000');
     * var address = Address6.fromBigInt(bigInt);
     * address.correctForm(); // '::e8:d4a5:1000'
     */ static fromBigInt(bigInt) {
        if (bigInt < BigInt(0) || bigInt > (BigInt(1) << BigInt(constants6.BITS)) - BigInt(1)) {
            throw new address_error_1.AddressError('IPv6 BigInt must be in the range 0 to 2**128 - 1');
        }
        const hex = bigInt.toString(16).padStart(32, '0');
        const groups = [];
        for(let i = 0; i < constants6.GROUPS; i++){
            groups.push(hex.slice(i * 4, (i + 1) * 4));
        }
        return new Address6(groups.join(':'));
    }
    /**
     * Parse a URL (with optional bracketed host and port) into an address and
     * port. Returns either `{ address, port }` on success or
     * `{ error, address: null, port: null }` if the URL could not be parsed.
     * Ports are returned as numbers (or `null` if absent or out of range).
     * @example
     * var addressAndPort = Address6.fromURL('http://[ffff::]:8080/foo/');
     * addressAndPort.address.correctForm(); // 'ffff::'
     * addressAndPort.port; // 8080
     */ static fromURL(url) {
        var _a;
        let host;
        let port = null;
        let result;
        let error;
        // Remove the protocol prefix, if any
        const stripped = url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
        // If we have brackets parse them and find a port
        if (stripped.indexOf('[') !== -1 && stripped.indexOf(']:') !== -1) {
            error = 'failed to parse address with port';
            result = constants6.RE_URL_WITH_PORT.exec(stripped);
            if (result === null) {
                return {
                    error,
                    address: null,
                    port: null
                };
            }
            host = result[1];
            port = result[2];
        } else {
            error = 'failed to parse address from URL';
            result = constants6.RE_URL.exec(stripped);
            if (result === null) {
                return {
                    error,
                    address: null,
                    port: null
                };
            }
            host = (_a = result[1]) !== null && _a !== void 0 ? _a : result[2];
        }
        // If there's a port convert it to an integer
        if (port) {
            port = parseInt(port, 10);
            // squelch out of range ports (valid ports are 0-65535)
            if (port < 0 || port > 65535) {
                port = null;
            }
        } else {
            // Standardize `undefined` to `null`
            port = null;
        }
        // The URL character class is a superset of valid IPv6, so a host the
        // regex accepted (an IPv4 literal, bare punctuation, too many groups)
        // can still be rejected by the parser
        let address;
        try {
            address = new Address6(host);
        } catch  {
            return {
                error,
                address: null,
                port: null
            };
        }
        return {
            address,
            port
        };
    }
    /**
     * Construct an `Address6` from an address and a hex subnet mask given as
     * separate strings (e.g. as returned by Node's `os.networkInterfaces()`).
     * Throws `AddressError` if the mask is non-contiguous (e.g.
     * `ffff::ffff`).
     * @example
     * var address = Address6.fromAddressAndMask('fe80::1', 'ffff:ffff:ffff:ffff::');
     * address.subnetMask; // 64
     */ static fromAddressAndMask(address, mask) {
        const bits = common.prefixLengthFromMask(new Address6(mask).bigInt(), constants6.BITS);
        return new Address6(`${address}/${bits}`);
    }
    /**
     * Construct an `Address6` from an address and a Cisco-style wildcard mask
     * given as separate strings (e.g. `::ffff:ffff:ffff:ffff` for a `/64`).
     * The wildcard mask is the bitwise inverse of the subnet mask. Throws
     * `AddressError` if the mask is non-contiguous.
     * @example
     * var address = Address6.fromAddressAndWildcardMask('fe80::1', '::ffff:ffff:ffff:ffff');
     * address.subnetMask; // 64
     */ static fromAddressAndWildcardMask(address, wildcardMask) {
        const wildcard = new Address6(wildcardMask).bigInt();
        const allOnes = (BigInt(1) << BigInt(constants6.BITS)) - BigInt(1);
        const mask = wildcard ^ allOnes;
        const bits = common.prefixLengthFromMask(mask, constants6.BITS);
        return new Address6(`${address}/${bits}`);
    }
    /**
     * Construct an `Address6` from a wildcard pattern with trailing `*`
     * groups. The number of trailing wildcards determines the prefix
     * length: each `*` represents 16 bits. `::` is expanded to zero groups
     * (not wildcards) before evaluating trailing wildcards.
     *
     * Only trailing whole-group wildcards are supported. Partial-group
     * wildcards (e.g. `2001:db8::0*`) and interior wildcards (e.g.
     * `*::1`) throw `AddressError`.
     * @example
     * Address6.fromWildcard('2001:db8:*:*:*:*:*:*').subnet;  // '/32'
     * Address6.fromWildcard('2001:db8::*').subnet;           // '/112'
     * Address6.fromWildcard('*:*:*:*:*:*:*:*').subnet;       // '/0'
     */ static fromWildcard(input) {
        if (input.includes('%') || input.includes('/')) {
            throw new address_error_1.AddressError('Wildcard pattern must not include a zone or CIDR suffix');
        }
        const halves = input.split('::');
        if (halves.length > 2) {
            throw new address_error_1.AddressError("Wildcard pattern cannot contain more than one '::'");
        }
        let groups;
        if (halves.length === 2) {
            const left = halves[0] === '' ? [] : halves[0].split(':');
            const right = halves[1] === '' ? [] : halves[1].split(':');
            const remaining = constants6.GROUPS - left.length - right.length;
            if (remaining < 1) {
                throw new address_error_1.AddressError("Wildcard pattern with '::' has too many groups");
            }
            groups = [
                ...left,
                ...new Array(remaining).fill('0'),
                ...right
            ];
        } else {
            groups = input.split(':');
        }
        if (groups.length !== constants6.GROUPS) {
            throw new address_error_1.AddressError('Wildcard pattern must have 8 groups');
        }
        let firstWildcard = -1;
        for(let i = 0; i < groups.length; i++){
            if (groups[i] === '*') {
                if (firstWildcard === -1) {
                    firstWildcard = i;
                }
            } else if (firstWildcard !== -1) {
                throw new address_error_1.AddressError('Wildcard `*` must only appear in trailing groups (e.g. `2001:db8:*:*:*:*:*:*`)');
            }
        }
        const trailing = firstWildcard === -1 ? 0 : groups.length - firstWildcard;
        const replaced = groups.map((g)=>g === '*' ? '0' : g);
        const subnetBits = constants6.BITS - trailing * 16;
        return new Address6(`${replaced.join(':')}/${subnetBits}`);
    }
    /**
     * Create an IPv6-mapped address given an IPv4 address
     * @param {string} address - An IPv4 address string
     * @returns {Address6}
     * @example
     * var address = Address6.fromAddress4('192.168.0.1');
     * address.correctForm(); // '::ffff:c0a8:1'
     * address.to4in6(); // '::ffff:192.168.0.1'
     */ static fromAddress4(address) {
        const address4 = new ipv4_1.Address4(address);
        const mask6 = constants6.BITS - (constants4.BITS - address4.subnetMask);
        return new Address6(`::ffff:${address4.correctForm()}/${mask6}`);
    }
    /**
     * Return an address from ip6.arpa form. A full 32-nibble name gives a /128
     * address; a shorter name, as used for a delegated reverse zone, gives the
     * network it covers, with a subnet mask of four bits per nibble, so
     * `fromArpa(x.reverseForm())` round-trips {@link reverseForm} for any prefix.
     * @param {string} arpaFormAddress - an 'ip6.arpa' form address
     * @returns {Adress6}
     * @example
     * var address = Address6.fromArpa(e.f.f.f.3.c.2.6.f.f.f.e.6.6.8.e.1.0.6.7.9.4.e.c.0.0.0.0.1.0.0.2.ip6.arpa.)
     * address.correctForm(); // '2001:0:ce49:7601:e866:efff:62c3:fffe'
     * Address6.fromArpa('8.b.d.0.1.0.0.2.ip6.arpa.').networkForm(); // '2001:db8::/32'
     */ static fromArpa(arpaFormAddress) {
        // remove an ending ".ip6.arpa", in any case and with or without the root
        // dot
        const nibbles = arpaFormAddress.replace(/(\.ip6\.arpa)?\.?$/i, '');
        if (!/^[0-9a-f](\.[0-9a-f]){0,31}$/i.test(nibbles)) {
            throw new address_error_1.AddressError("Invalid 'ip6.arpa' form.");
        }
        const reversed = nibbles.split('.').reverse();
        const subnetMask = reversed.length * 4;
        const hex = reversed.join('').padEnd(32, '0');
        const groups = [];
        for(let i = 0; i < constants6.GROUPS; i++){
            groups.push(hex.slice(i * 4, (i + 1) * 4));
        }
        return new Address6(`${groups.join(':')}/${subnetMask}`);
    }
    /**
     * Return the Microsoft UNC transcription of the address
     * @returns {String} the Microsoft UNC transcription of the address
     */ microsoftTranscription() {
        return `${this.correctForm().replace(/:/g, '-')}.ipv6-literal.net`;
    }
    /**
     * Return the first n bits of the address, defaulting to the subnet mask
     * @param {number} [mask=subnet] - the number of bits to mask
     * @returns {String} the first n bits of the address as a string
     */ mask(mask = this.subnetMask) {
        return this.getBitsBase2(0, mask);
    }
    /**
     * Return the number of possible subnets of a given size in the address
     * @param {number} [subnetSize=128] - the subnet size
     * @returns {String}
     */ // TODO: probably useful to have a numeric version of this too
    possibleSubnets(subnetSize = 128) {
        const availableBits = constants6.BITS - this.subnetMask;
        const subnetBits = Math.abs(subnetSize - constants6.BITS);
        const subnetPowers = availableBits - subnetBits;
        if (subnetPowers < 0) {
            return '0';
        }
        return addCommas((BigInt('2') ** BigInt(subnetPowers)).toString(10));
    }
    /**
     * Helper function getting start address.
     * @returns {bigint}
     */ _startAddress() {
        return BigInt(`0b${this.mask() + '0'.repeat(constants6.BITS - this.subnetMask)}`);
    }
    /**
     * The first address in the range given by this address' subnet
     * Often referred to as the Network Address.
     * @returns {Address6}
     */ startAddress() {
        return Address6.fromBigInt(this._startAddress());
    }
    /**
     * The first host address in the range given by this address's subnet ie
     * the first address after the Network Address
     * @returns {Address6}
     */ startAddressExclusive() {
        const adjust = BigInt('1');
        return Address6.fromBigInt(this._startAddress() + adjust);
    }
    /**
     * Helper function getting end address.
     * @returns {bigint}
     */ _endAddress() {
        return BigInt(`0b${this.mask() + '1'.repeat(constants6.BITS - this.subnetMask)}`);
    }
    /**
     * The last address in the range given by this address's subnet. IPv6 has
     * no broadcast address, so this is an ordinary assignable address (in a
     * 64-bit-interface-identifier subnet it falls inside the reserved
     * subnet-anycast block of [RFC 2526](https://datatracker.ietf.org/doc/html/rfc2526)).
     * @returns {Address6}
     */ endAddress() {
        return Address6.fromBigInt(this._endAddress());
    }
    /**
     * The address one before {@link endAddress}. This is the IPv6 counterpart
     * of the IPv4 method that skips the broadcast address; IPv6 has no broadcast,
     * so it drops exactly one address and does not model the 128 reserved
     * subnet-anycast identifiers of [RFC 2526](https://datatracker.ietf.org/doc/html/rfc2526).
     * @returns {Address6}
     */ endAddressExclusive() {
        const adjust = BigInt('1');
        return Address6.fromBigInt(this._endAddress() - adjust);
    }
    /**
     * Returns the address `n` addresses after this one (or before, when `n` is
     * negative), keeping this address's subnet mask. Throws `AddressError` when
     * the result would fall outside the IPv6 address space or `n` is not an
     * integer.
     * @param {number | bigint} n
     * @returns {Address6}
     * @example
     * new Address6('2001:db8::/64').offset(1).correctForm(); // '2001:db8::1'
     */ offset(n) {
        return Address6.fromBigInt(common.offsetBigInt(this.bigInt(), n, constants6.BITS, 'IPv6')).withSubnetMask(this.subnetMask);
    }
    /**
     * Returns the network that follows this address's network: the address after
     * {@link endAddress}, with the same subnet mask. Throws `AddressError` when
     * this network is the last one in the address space.
     * @returns {Address6}
     * @example
     * new Address6('2001:db8::/64').nextNetwork().networkForm(); // '2001:db8:0:1::/64'
     */ nextNetwork() {
        return Address6.fromBigInt(common.offsetBigInt(this._endAddress(), 1, constants6.BITS, 'IPv6')).withSubnetMask(this.subnetMask);
    }
    withSubnetMask(subnetMask) {
        return new Address6(`${this.correctForm()}/${subnetMask}`);
    }
    /**
     * The hex form of the subnet mask, e.g. `ffff:ffff:ffff:ffff::` for a
     * `/64`. Returns an `Address6`; call `.correctForm()` for the string.
     * @returns {Address6}
     */ subnetMaskAddress() {
        return Address6.fromBigInt(BigInt(`0b${'1'.repeat(this.subnetMask)}${'0'.repeat(constants6.BITS - this.subnetMask)}`));
    }
    /**
     * The Cisco-style wildcard mask, e.g. `::ffff:ffff:ffff:ffff` for a
     * `/64`. This is the bitwise inverse of `subnetMaskAddress()`. Returns
     * an `Address6`; call `.correctForm()` for the string.
     * @returns {Address6}
     */ wildcardMask() {
        return Address6.fromBigInt(BigInt(`0b${'0'.repeat(this.subnetMask)}${'1'.repeat(constants6.BITS - this.subnetMask)}`));
    }
    /**
     * The network address in CIDR string form, e.g. `2001:db8::/32` for
     * `2001:db8::1/32`. For an address with no explicit subnet the prefix
     * is `/128`, e.g. `networkForm()` on `2001:db8::1` returns
     * `2001:db8::1/128`.
     * @returns {string}
     */ networkForm() {
        return `${this.startAddress().correctForm()}/${this.subnetMask}`;
    }
    /**
     * Return the scope of the address. The 4-bit scope field
     * ([RFC 4291 §2.7](https://datatracker.ietf.org/doc/html/rfc4291#section-2.7))
     * is only defined for multicast addresses; for unicast addresses the scope
     * is derived from the address type per
     * [RFC 4007 §6](https://datatracker.ietf.org/doc/html/rfc4007#section-6).
     * @returns {String}
     */ getScope() {
        const type = this.getType();
        if (type === 'Multicast' || type.startsWith('Multicast ')) {
            const scope = constants6.SCOPES[parseInt(this.getBits(12, 16).toString(10), 10)];
            return scope || 'Unknown';
        }
        // RFC 4291 §2.5.3: the loopback address is treated as having Link-Local
        // scope. (Multicast scope 1, "Interface-Local", is a different concept
        // used only for loopback transmission of multicast.)
        if (type === 'Link-local unicast' || type === 'Loopback') {
            return 'Link local';
        }
        // RFC 4007 §6: the unspecified address has no scope.
        if (type === 'Unspecified') {
            return 'Unknown';
        }
        return 'Global';
    }
    /**
     * Return the type of the address
     * @returns {String}
     */ getType() {
        for(let i = 0; i < TYPE_SUBNETS.length; i++){
            const entry = TYPE_SUBNETS[i];
            if (this.isHostInSubnet(entry[0])) {
                return entry[1];
            }
        }
        return 'Global unicast';
    }
    /**
     * Return the bits in the given range as a BigInt
     * @returns {bigint}
     */ getBits(start, end) {
        return BigInt(`0b${this.getBitsBase2(start, end)}`);
    }
    /**
     * Return the bits in the given range as a base-2 string
     * @returns {String}
     */ getBitsBase2(start, end) {
        return this.binaryZeroPad().slice(start, end);
    }
    /**
     * Return the bits in the given range as a base-16 string
     * @returns {String}
     */ getBitsBase16(start, end) {
        const length = end - start;
        if (length % 4 !== 0) {
            throw new Error('Length of bits to retrieve must be divisible by four');
        }
        return this.getBits(start, end).toString(16).padStart(length / 4, '0');
    }
    /**
     * Return the bits that are set past the subnet mask length
     * @returns {String}
     */ getBitsPastSubnet() {
        return this.getBitsBase2(this.subnetMask, constants6.BITS);
    }
    /**
     * Return the reversed ip6.arpa form of the address
     * @param {Object} options
     * @param {boolean} options.omitSuffix - omit the "ip6.arpa" suffix
     * @returns {String}
     */ reverseForm(options) {
        if (!options) {
            options = {};
        }
        const characters = Math.floor(this.subnetMask / 4);
        const reversed = this.canonicalForm().replace(/:/g, '').split('').slice(0, characters).reverse().join('.');
        if (characters > 0) {
            if (options.omitSuffix) {
                return reversed;
            }
            return `${reversed}.ip6.arpa.`;
        }
        if (options.omitSuffix) {
            return '';
        }
        return 'ip6.arpa.';
    }
    /**
     * Returns the address in correct form, per
     * [RFC 5952](https://datatracker.ietf.org/doc/html/rfc5952): leading zeros
     * stripped, the longest run of zero groups collapsed to `::`, and hex digits
     * lowercased (e.g. `2001:db8::1`). This is the recommended form for display.
     */ correctForm() {
        let i;
        let groups = [];
        let zeroCounter = 0;
        const zeroes = [];
        for(i = 0; i < this.parsedAddress.length; i++){
            const value = parseInt(this.parsedAddress[i], 16);
            if (value === 0) {
                zeroCounter++;
            }
            if (value !== 0 && zeroCounter > 0) {
                if (zeroCounter > 1) {
                    zeroes.push([
                        i - zeroCounter,
                        i - 1
                    ]);
                }
                zeroCounter = 0;
            }
        }
        // Do we end with a string of zeroes?
        if (zeroCounter > 1) {
            zeroes.push([
                this.parsedAddress.length - zeroCounter,
                this.parsedAddress.length - 1
            ]);
        }
        const zeroLengths = zeroes.map((n)=>n[1] - n[0] + 1);
        if (zeroes.length > 0) {
            const index = zeroLengths.indexOf(Math.max(...zeroLengths));
            groups = compact(this.parsedAddress, zeroes[index]);
        } else {
            groups = this.parsedAddress;
        }
        for(i = 0; i < groups.length; i++){
            if (groups[i] !== 'compact') {
                groups[i] = parseInt(groups[i], 16).toString(16);
            }
        }
        let correct = groups.join(':');
        correct = correct.replace(/^compact$/, '::');
        correct = correct.replace(/(^compact)|(compact$)/, ':');
        correct = correct.replace(/compact/, '');
        return correct;
    }
    /**
     * Return a zero-padded base-2 string representation of the address
     * @returns {String}
     * @example
     * var address = new Address6('2001:4860:4001:803::1011');
     * address.binaryZeroPad();
     * // '0010000000000001010010000110000001000000000000010000100000000011
     * //  0000000000000000000000000000000000000000000000000001000000010001'
     */ binaryZeroPad() {
        if (this._binaryZeroPad === undefined) {
            this._binaryZeroPad = this.bigInt().toString(2).padStart(constants6.BITS, '0');
        }
        return this._binaryZeroPad;
    }
    /**
     * Parses a v4-in-v6 string (e.g. `::ffff:192.168.0.1`) by extracting the
     * trailing IPv4 address into `this.address4` / `this.parsedAddress4` and
     * returning the address with the v4 portion converted to two v6 groups.
     * Used internally by `parse()`.
     */ // TODO: Improve the semantics of this helper function
    parse4in6(address) {
        if (address.indexOf('.') === -1) {
            return address;
        }
        const groups = address.split(':');
        const lastGroup = groups.slice(-1)[0];
        // RE_ADDRESS rejects octets with a leading zero, so a dotted-quad tail is
        // matched permissively first: that way this notation still gets its own
        // message with the offending octet highlighted, rather than falling
        // through as an unrecognized group.
        const v4Octets = lastGroup.split('.');
        if (v4Octets.length === constants4.GROUPS && v4Octets.every((octet)=>/^\d{1,3}$/.test(octet))) {
            if (v4Octets.some((octet)=>/^0\d/.test(octet))) {
                // The prefix groups haven't been through the bad-character check
                // yet, so escape them before including in the error HTML.
                const highlighted = v4Octets.map(spanLeadingZeroes4).join('.');
                const prefix = groups.slice(0, -1).map(helpers.escapeHtml).join(':');
                const separator = groups.length > 1 ? ':' : '';
                throw new address_error_1.AddressError("IPv4 addresses can't have leading zeroes.", `${prefix}${separator}${highlighted}`);
            }
        }
        const address4 = lastGroup.match(constants4.RE_ADDRESS);
        if (address4) {
            this.parsedAddress4 = address4[0];
            const v4Suffix = this.subnetMask >= 96 ? `/${this.subnetMask - 96}` : '';
            this.address4 = new ipv4_1.Address4(`${this.parsedAddress4}${v4Suffix}`);
            this.v4 = true;
            groups[groups.length - 1] = this.address4.toGroup6();
            address = groups.join(':');
        }
        return address;
    }
    /**
     * Parses an IPv6 address string into its 8 hexadecimal groups (expanding
     * any `::` elision and any trailing v4-in-v6 portion) and stores the result
     * on `this.parsedAddress`. Called automatically by the constructor; you
     * typically don't need to call it directly. Throws `AddressError` if the
     * input is malformed.
     */ // TODO: Make private?
    parse(address) {
        address = this.parse4in6(address);
        const badCharacters = address.match(constants6.RE_BAD_CHARACTERS);
        if (badCharacters) {
            throw new address_error_1.AddressError(`Bad character${badCharacters.length > 1 ? 's' : ''} detected in address: ${badCharacters.join('')}`, address.replace(constants6.RE_BAD_CHARACTERS, '<span class="parse-error">$1</span>'));
        }
        const badAddress = address.match(constants6.RE_BAD_ADDRESS);
        if (badAddress) {
            throw new address_error_1.AddressError(`Address failed regex: ${badAddress.join('')}`, address.replace(constants6.RE_BAD_ADDRESS, '<span class="parse-error">$1</span>'));
        }
        let groups = [];
        const halves = address.split('::');
        if (halves.length === 2) {
            let first = halves[0].split(':');
            let last = halves[1].split(':');
            if (first.length === 1 && first[0] === '') {
                first = [];
            }
            if (last.length === 1 && last[0] === '') {
                last = [];
            }
            const remaining = this.groups - (first.length + last.length);
            if (!remaining) {
                throw new address_error_1.AddressError('Error parsing groups');
            }
            this.elidedGroups = remaining;
            this.elisionBegin = first.length;
            this.elisionEnd = first.length + this.elidedGroups;
            groups = groups.concat(first);
            for(let i = 0; i < remaining; i++){
                groups.push('0');
            }
            groups = groups.concat(last);
        } else if (halves.length === 1) {
            groups = address.split(':');
            this.elidedGroups = 0;
        } else {
            throw new address_error_1.AddressError('Too many :: groups found');
        }
        groups = groups.map((group)=>parseInt(group, 16).toString(16));
        if (groups.length !== this.groups) {
            throw new address_error_1.AddressError('Incorrect number of groups found');
        }
        return groups;
    }
    /**
     * Returns the canonical (fully expanded) form of the address: all 8 groups,
     * each padded to 4 hex digits, with no `::` collapsing
     * (e.g. `2001:0db8:0000:0000:0000:0000:0000:0001`). Useful for sorting and
     * byte-exact comparison.
     */ canonicalForm() {
        return this.parsedAddress.map(paddedHex).join(':');
    }
    /**
     * Return the decimal form of the address
     * @returns {String}
     */ decimal() {
        return this.parsedAddress.map((n)=>parseInt(n, 16).toString(10).padStart(5, '0')).join(':');
    }
    /**
     * Return the address as a BigInt
     * @returns {bigint}
     */ bigInt() {
        return BigInt(`0x${this.parsedAddress.map(paddedHex).join('')}`);
    }
    /**
     * Return the last two groups of this address as an IPv4 address string.
     * If this address carries a CIDR prefix that covers the trailing 32 bits
     * (i.e. `subnetMask >= 96`), the resulting `Address4` inherits the
     * corresponding v4 prefix (`subnetMask - 96`); otherwise it defaults to
     * `/32`.
     * @returns {Address4}
     * @example
     * var address = new Address6('2001:4860:4001::1825:bf11');
     * address.to4().correctForm(); // '24.37.191.17'
     */ to4() {
        const binary = this.binaryZeroPad().split('');
        const hex = BigInt(`0b${binary.slice(96, 128).join('')}`).toString(16).padStart(8, '0');
        if (this.subnetMask >= 96) {
            const v4Mask = this.subnetMask - 96;
            const groups = [];
            for(let i = 0; i < 8; i += 2){
                groups.push(parseInt(hex.slice(i, i + 2), 16));
            }
            return new ipv4_1.Address4(`${groups.join('.')}/${v4Mask}`);
        }
        return ipv4_1.Address4.fromHex(hex);
    }
    /**
     * Return the v4-in-v6 form of the address
     * @returns {String}
     */ to4in6() {
        const address4 = this.to4();
        const address6 = new Address6(this.parsedAddress.slice(0, 6).join(':'), 6);
        const correct = address6.correctForm();
        let infix = '';
        if (!/:$/.test(correct)) {
            infix = ':';
        }
        return correct + infix + address4.correctForm();
    }
    /**
     * Decodes the Teredo tunneling fields embedded in this address. Returns the
     * Teredo prefix, server IPv4, client IPv4, raw flag bits, cone-NAT flag,
     * UDP port, and Microsoft-format flag breakdown (reserved, universal/local,
     * group/individual, nonce). Only meaningful for addresses in `2001::/32`.
     */ inspectTeredo() {
        /*
        - Bits 0 to 31 are set to the Teredo prefix (normally 2001:0000::/32).
        - Bits 32 to 63 embed the primary IPv4 address of the Teredo server that
          is used.
        - Bits 64 to 79 can be used to define some flags. Currently only the
          higher order bit is used; it is set to 1 if the Teredo client is
          located behind a cone NAT, 0 otherwise. For Microsoft's Windows Vista
          and Windows Server 2008 implementations, more bits are used. In those
          implementations, the format for these 16 bits is "CRAAAAUG AAAAAAAA",
          where "C" remains the "Cone" flag. The "R" bit is reserved for future
          use. The "U" bit is for the Universal/Local flag (set to 0). The "G" bit
          is Individual/Group flag (set to 0). The A bits are set to a 12-bit
          randomly generated number chosen by the Teredo client to introduce
          additional protection for the Teredo node against IPv6-based scanning
          attacks.
        - Bits 80 to 95 contains the obfuscated UDP port number. This is the
          port number that is mapped by the NAT to the Teredo client with all
          bits inverted.
        - Bits 96 to 127 contains the obfuscated IPv4 address. This is the
          public IPv4 address of the NAT with all bits inverted.
        */ const prefix = this.getBitsBase16(0, 32);
        const bitsForUdpPort = this.getBits(80, 96);
        const udpPort = (bitsForUdpPort ^ BigInt('0xffff')).toString();
        const server4 = ipv4_1.Address4.fromHex(this.getBitsBase16(32, 64));
        const bitsForClient4 = this.getBits(96, 128);
        const client4 = ipv4_1.Address4.fromHex((bitsForClient4 ^ BigInt('0xffffffff')).toString(16).padStart(8, '0'));
        const flagsBase2 = this.getBitsBase2(64, 80);
        const coneNat = (0, common_1.testBit)(flagsBase2, 15);
        const reserved = (0, common_1.testBit)(flagsBase2, 14);
        const groupIndividual = (0, common_1.testBit)(flagsBase2, 8);
        const universalLocal = (0, common_1.testBit)(flagsBase2, 9);
        const nonce = BigInt(`0b${flagsBase2.slice(2, 6) + flagsBase2.slice(8, 16)}`).toString(10);
        return {
            prefix: `${prefix.slice(0, 4)}:${prefix.slice(4, 8)}`,
            server4: server4.address,
            client4: client4.address,
            flags: flagsBase2,
            coneNat,
            microsoft: {
                reserved,
                universalLocal,
                groupIndividual,
                nonce
            },
            udpPort
        };
    }
    /**
     * Decodes the 6to4 tunneling fields embedded in this address. Returns the
     * 6to4 prefix and the embedded IPv4 gateway address. Only meaningful for
     * addresses in `2002::/16`.
     */ inspect6to4() {
        /*
        - Bits 0 to 15 are set to the 6to4 prefix (2002::/16).
        - Bits 16 to 48 embed the IPv4 address of the 6to4 gateway that is used.
        */ const prefix = this.getBitsBase16(0, 16);
        const gateway = ipv4_1.Address4.fromHex(this.getBitsBase16(16, 48));
        return {
            prefix: prefix.slice(0, 4),
            gateway: gateway.address
        };
    }
    /**
     * Return a v6 6to4 address from a v6 v4inv6 address
     * @returns {Address6}
     */ to6to4() {
        if (!this.is4()) {
            return null;
        }
        const addr6to4 = [
            '2002',
            this.getBitsBase16(96, 112),
            this.getBitsBase16(112, 128),
            '',
            '/16'
        ].join(':');
        return new Address6(addr6to4);
    }
    /**
     * Embed an IPv4 address into a NAT64 IPv6 address using the encoding
     * defined by [RFC 6052](https://datatracker.ietf.org/doc/html/rfc6052).
     * The default prefix is the well-known prefix `64:ff9b::/96`. The prefix
     * length must be one of 32, 40, 48, 56, 64, or 96; for prefixes shorter
     * than /64 the IPv4 octets are split around the reserved bits 64–71.
     * @example
     * Address6.fromAddress4Nat64('192.0.2.33').correctForm(); // '64:ff9b::c000:221'
     * Address6.fromAddress4Nat64('192.0.2.33', '2001:db8::/32').correctForm(); // '2001:db8:c000:221::'
     */ static fromAddress4Nat64(address, prefix = '64:ff9b::/96') {
        const v4 = new ipv4_1.Address4(address);
        const prefix6 = new Address6(prefix);
        const pl = prefix6.subnetMask;
        if (pl !== 32 && pl !== 40 && pl !== 48 && pl !== 56 && pl !== 64 && pl !== 96) {
            throw new address_error_1.AddressError('NAT64 prefix length must be 32, 40, 48, 56, 64, or 96');
        }
        const prefixBits = prefix6.binaryZeroPad();
        const v4Bits = v4.binaryZeroPad();
        let bits;
        if (pl === 96) {
            bits = prefixBits.slice(0, 96) + v4Bits;
        } else {
            const beforeU = 64 - pl;
            bits = [
                prefixBits.slice(0, pl),
                v4Bits.slice(0, beforeU),
                // Bits 64 to 71 are the reserved u octet and are always zero.
                '00000000',
                v4Bits.slice(beforeU),
                '0'.repeat(128 - 72 - (32 - beforeU))
            ].join('');
        }
        const hex = BigInt(`0b${bits}`).toString(16).padStart(32, '0');
        const groups = [];
        for(let i = 0; i < 8; i++){
            groups.push(hex.slice(i * 4, (i + 1) * 4));
        }
        return new Address6(groups.join(':'));
    }
    /**
     * Extract the embedded IPv4 address from a NAT64 IPv6 address using the
     * encoding defined by [RFC 6052](https://datatracker.ietf.org/doc/html/rfc6052).
     * The default prefix is the well-known prefix `64:ff9b::/96`. Returns
     * `null` if this address is not contained within the given prefix.
     * @example
     * new Address6('64:ff9b::c000:221').toAddress4Nat64()!.correctForm(); // '192.0.2.33'
     */ toAddress4Nat64(prefix = '64:ff9b::/96') {
        const prefix6 = new Address6(prefix);
        const pl = prefix6.subnetMask;
        if (pl !== 32 && pl !== 40 && pl !== 48 && pl !== 56 && pl !== 64 && pl !== 96) {
            throw new address_error_1.AddressError('NAT64 prefix length must be 32, 40, 48, 56, 64, or 96');
        }
        if (!this.isHostInSubnet(prefix6)) {
            return null;
        }
        const bits = this.binaryZeroPad();
        let v4Bits;
        if (pl === 96) {
            v4Bits = bits.slice(96, 128);
        } else {
            const beforeU = 64 - pl;
            v4Bits = bits.slice(pl, pl + beforeU) + bits.slice(72, 72 + (32 - beforeU));
        }
        const octets = [];
        for(let i = 0; i < 4; i++){
            octets.push(parseInt(v4Bits.slice(i * 8, (i + 1) * 8), 2).toString());
        }
        return new ipv4_1.Address4(octets.join('.'));
    }
    /**
     * Return a byte array.
     *
     * To get a Node.js `Buffer`, wrap the result: `Buffer.from(address.toByteArray())`.
     * @returns {Array}
     */ toByteArray() {
        const value = this.bigInt().toString(16).padStart(constants6.BITS / 4, '0');
        const bytes = [];
        for(let i = 0, length = value.length; i < length; i += 2){
            bytes.push(parseInt(value.substring(i, i + 2), 16));
        }
        return bytes;
    }
    /**
     * Return an unsigned byte array.
     *
     * To get a Node.js `Buffer`, wrap the result: `Buffer.from(address.toUnsignedByteArray())`.
     * @returns {Array}
     */ toUnsignedByteArray() {
        // toByteArray() emits 0 to 255, so unsigning it is an identity mapping and
        // the two methods return equal arrays. 11.0.0 keeps one of them and makes
        // this a deprecated alias; test/common-test.ts fails at that version.
        return this.toByteArray().map(unsignByte);
    }
    /**
     * Convert a byte array to an Address6 object.
     *
     * Accepts unsigned bytes (0 to 255) or signed bytes (-128 to 127, as an
     * `Int8Array` or a Java `byte[]` holds them), folding signed values to their
     * unsigned equivalent. Throws `AddressError` unless given exactly 16
     * integers from -128 to 255.
     *
     * To convert from a Node.js `Buffer`, spread it: `Address6.fromByteArray([...buf])`.
     * @returns {Address6}
     */ static fromByteArray(bytes) {
        // Address4.fromByteArray takes unsigned bytes only. 11.0.0 aligns this
        // method with it, at which point the -128 floor here, unsignByte, and the
        // mapping below all go; test/common-test.ts fails at that version.
        common.assertByteArray(bytes, 16, 'IPv6', -128);
        return this.fromUnsignedByteArray(bytes.map(unsignByte));
    }
    /**
     * Convert an unsigned byte array to an Address6 object.
     *
     * Throws `AddressError` unless given exactly 16 integers from 0 to 255.
     *
     * To convert from a Node.js `Buffer`, spread it: `Address6.fromUnsignedByteArray([...buf])`.
     * @returns {Address6}
     */ static fromUnsignedByteArray(bytes) {
        common.assertByteArray(bytes, 16, 'IPv6', 0);
        const BYTE_MAX = BigInt('256');
        let result = BigInt('0');
        let multiplier = BigInt('1');
        for(let i = bytes.length - 1; i >= 0; i--){
            result += multiplier * BigInt(bytes[i].toString(10));
            multiplier *= BYTE_MAX;
        }
        return Address6.fromBigInt(result);
    }
    /**
     * Returns true if the address is in the canonical form, false otherwise
     * @returns {boolean}
     */ isCanonical() {
        return this.addressMinusSuffix === this.canonicalForm();
    }
    /**
     * Returns true if the address is a link-local unicast address in `fe80::/10`
     * ([RFC 4291 §2.4](https://datatracker.ietf.org/doc/html/rfc4291#section-2.4))
     * or an IPv4-mapped / NAT64 address whose embedded IPv4 address is link-local
     * (`169.254.0.0/16`, e.g. `::ffff:169.254.169.254`), false otherwise.
     * @returns {boolean}
     */ isLinkLocal() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isLinkLocal();
        }
        return this.isHostInSubnet(LINK_LOCAL_SUBNET);
    }
    /**
     * Returns true if the address is a multicast address, false otherwise
     * @returns {boolean}
     */ isMulticast() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isMulticast();
        }
        const type = this.getType();
        return type === 'Multicast' || type.startsWith('Multicast ');
    }
    /**
     * Returns true if the address was written in v4-in-v6 dotted-quad notation
     * (e.g. `::ffff:127.0.0.1`), false otherwise. This is a notation-level flag
     * and does not reflect whether the address bits lie in the IPv4-mapped
     * (`::ffff:0:0/96`) subnet — for that, see {@link isMapped4}.
     * @returns {boolean}
     */ is4() {
        return this.v4;
    }
    /**
     * Returns true if the address is an IPv4-mapped IPv6 address in
     * `::ffff:0:0/96` ([RFC 4291 §2.5.5.2](https://datatracker.ietf.org/doc/html/rfc4291#section-2.5.5.2)),
     * false otherwise. Unlike {@link is4}, this checks the underlying address
     * bits rather than the textual notation, so `::ffff:127.0.0.1` and
     * `::ffff:7f00:1` both return true.
     * @returns {boolean}
     */ isMapped4() {
        return this.isHostInSubnet(IPV4_MAPPED_SUBNET);
    }
    /**
     * If this address embeds a routable IPv4 address — i.e. it is IPv4-mapped
     * (`::ffff:0:0/96`) or sits in the NAT64 well-known prefix (`64:ff9b::/96`,
     * [RFC 6052](https://datatracker.ietf.org/doc/html/rfc6052)) — return that
     * embedded address as an {@link Address4}; otherwise return null.
     *
     * The special-property checks (`isLoopback`, `isLinkLocal`, `isMulticast`,
     * `isUnspecified`, `isPrivate`, `isCGNAT`, `isBroadcast`) call this first and
     * delegate to the embedded {@link Address4} when present, so a literal such as
     * `::ffff:127.0.0.1` is classified by what it actually reaches (loopback)
     * rather than by its IPv6 wrapper (which `getType()` reports as IPv4-mapped).
     * This matters wherever the checks back a trust-boundary decision (e.g. an
     * SSRF allow/deny filter): without normalization, `::ffff:10.0.0.1`,
     * `::ffff:169.254.169.254`, `64:ff9b::7f00:1`, etc. would all read as
     * non-internal.
     * @returns {Address4 | null}
     */ embeddedIPv4() {
        if (this.isMapped4() || this.isHostInSubnet(NAT64_WELL_KNOWN_SUBNET)) {
            return this.to4();
        }
        return null;
    }
    /**
     * Returns true if the address is a Teredo address, false otherwise
     * @returns {boolean}
     */ isTeredo() {
        return this.isHostInSubnet(TEREDO_SUBNET);
    }
    /**
     * Returns true if the address is a 6to4 address, false otherwise
     * @returns {boolean}
     */ is6to4() {
        return this.isHostInSubnet(SIX_TO_FOUR_SUBNET);
    }
    /**
     * Returns true if the address is a loopback address, false otherwise
     * @returns {boolean}
     */ isLoopback() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isLoopback();
        }
        return this.getType() === 'Loopback';
    }
    /**
     * Returns true if the address is a Unique Local Address in `fc00::/7` ([RFC 4193](https://datatracker.ietf.org/doc/html/rfc4193)). ULAs are the IPv6 equivalent of IPv4 [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) private addresses.
     * @returns {boolean}
     */ isULA() {
        return this.isHostInSubnet(ULA_SUBNET);
    }
    /**
     * Returns true if the address is private, i.e. a Unique Local Address in
     * `fc00::/7` ([RFC 4193](https://datatracker.ietf.org/doc/html/rfc4193)), an
     * address in the NAT64 local-use range `64:ff9b:1::/48`
     * ([RFC 8215](https://datatracker.ietf.org/doc/html/rfc8215)), or an
     * IPv4-mapped / NAT64 well-known address whose embedded IPv4 address is in
     * one of the [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918)
     * private ranges (e.g. `::ffff:10.0.0.1`). This is the IPv6 counterpart to
     * {@link Address4.isPrivate}; use it instead of {@link isULA} when you need to
     * catch mapped RFC 1918 addresses as well as native ULAs.
     *
     * The local-use NAT64 range is reported private as a whole rather than by
     * its embedded IPv4 address: an operator may carve a prefix of any RFC 6052
     * length out of `64:ff9b:1::/48`, so the same bits decode to different IPv4
     * addresses under different deployments and no single decoding is correct.
     * Use {@link toAddress4Nat64} with the deployment's prefix to decode one.
     * @returns {boolean}
     */ isPrivate() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isPrivate();
        }
        return this.isULA() || this.isHostInSubnet(NAT64_LOCAL_USE_SUBNET);
    }
    /**
     * Returns true if the address is an IPv4-mapped / NAT64 address whose embedded
     * IPv4 address is in the carrier-grade NAT range `100.64.0.0/10`
     * ([RFC 6598](https://datatracker.ietf.org/doc/html/rfc6598)), false
     * otherwise. There is no native IPv6 CGNAT range, so this only ever returns
     * true for an embedded IPv4 address (e.g. `::ffff:100.64.0.1`).
     * @returns {boolean}
     */ isCGNAT() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isCGNAT();
        }
        return false;
    }
    /**
     * Returns true if the address is an IPv4-mapped / NAT64 address whose embedded
     * IPv4 address is the limited broadcast address `255.255.255.255`
     * ([RFC 919](https://datatracker.ietf.org/doc/html/rfc919)), false otherwise.
     * There is no IPv6 broadcast, so this only ever returns true for an embedded
     * IPv4 address (e.g. `::ffff:255.255.255.255`).
     * @returns {boolean}
     */ isBroadcast() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isBroadcast();
        }
        return false;
    }
    /**
     * Returns true if the address is the unspecified address `::`.
     * @returns {boolean}
     */ isUnspecified() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isUnspecified();
        }
        return this.getType() === 'Unspecified';
    }
    /**
     * Returns true if the address is in the documentation prefix `2001:db8::/32` ([RFC 3849](https://datatracker.ietf.org/doc/html/rfc3849)).
     * @returns {boolean}
     */ isDocumentation() {
        return DOCUMENTATION_SUBNETS.some((subnet)=>this.isHostInSubnet(subnet));
    }
    /**
     * Returns true if the address is in the benchmarking range `2001:2::/48`
     * ([RFC 5180](https://datatracker.ietf.org/doc/html/rfc5180)) or is an
     * IPv4-mapped / NAT64 address whose embedded IPv4 address is in
     * `198.18.0.0/15`, false otherwise.
     * @returns {boolean}
     */ isBenchmarking() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isBenchmarking();
        }
        return this.isHostInSubnet(BENCHMARKING_SUBNET);
    }
    /**
     * Returns true if the address is globally reachable: inside the global
     * unicast allocation `2000::/3` (the only range the [IANA IPv6 Address Space
     * Registry](https://www.iana.org/assignments/ipv6-address-space/) assigns
     * for global unicast; everything else is reserved, ULA, link-local, or
     * multicast) and not in any block the [IANA IPv6 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv6-special-registry/)
     * marks as not globally reachable. An IPv4-mapped or NAT64 well-known
     * address answers for its embedded IPv4 address, so `::ffff:10.0.0.1` and
     * `64:ff9b::7f00:1` are not global. Teredo (`2001::/32`) and 6to4
     * (`2002::/16`) are not global either: the registry lists them as N/A and a
     * packet to one needs a relay.
     *
     * This covers everything the individual classifiers name and the blocks they
     * do not: the discard-only prefix `100::/64`, the IETF protocol assignments
     * in `2001::/23`, the deprecated site-local `fec0::/10` and IPv4-compatible
     * `::/96` ranges, and unallocated space such as `4000::/3`. It is the single
     * predicate to use where a request must not reach an internal or
     * special-purpose destination; see SECURITY.md.
     * @returns {boolean}
     */ isGlobal() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isGlobal();
        }
        return this.isHostInSubnet(GLOBAL_UNICAST_SUBNET) && common.isGloballyReachable.call(this, SPECIAL_PURPOSE_V6);
    }
    // #endregion
    // #region HTML
    /**
     * Returns the address as an HTTP URL with the host bracketed, e.g.
     * `http://[2001:db8::1]/`. If `optionalPort` is provided it is appended,
     * e.g. `http://[2001:db8::1]:8080/`.
     */ href(optionalPort) {
        if (optionalPort === undefined) {
            optionalPort = '';
        } else {
            optionalPort = `:${optionalPort}`;
        }
        return `http://[${this.correctForm()}]${optionalPort}/`;
    }
    /**
     * Returns an HTML `<a>` element whose `href` encodes the address in a URL
     * hash fragment (default prefix `/#address=`). Useful for linking between
     * pages of an address-inspector UI.
     * @param options.className - CSS class for the rendered `<a>` element
     * @param options.prefix - hash prefix prepended to the address (default `/#address=`)
     * @param options.v4 - when true, render the address in v4-in-v6 form
     */ link(options) {
        if (!options) {
            options = {};
        }
        if (options.className === undefined) {
            options.className = '';
        }
        if (options.prefix === undefined) {
            options.prefix = '/#address=';
        }
        if (options.v4 === undefined) {
            options.v4 = false;
        }
        let formFunction = this.correctForm;
        if (options.v4) {
            formFunction = this.to4in6;
        }
        const form = formFunction.call(this);
        const safeHref = helpers.escapeHtml(`${options.prefix}${form}`);
        const safeForm = helpers.escapeHtml(form);
        if (options.className) {
            const safeClass = helpers.escapeHtml(options.className);
            return `<a href="${safeHref}" class="${safeClass}">${safeForm}</a>`;
        }
        return `<a href="${safeHref}">${safeForm}</a>`;
    }
    /**
     * Groups an address.
     *
     * Returns an HTML fragment: each group is wrapped in a `<span>` carrying
     * the group classes an address-inspector UI hovers on. The address content
     * is HTML-escaped; anything you concatenate around it is your
     * responsibility.
     * @returns {String}
     */ group() {
        if (this.elidedGroups === 0) {
            // The simple case
            return helpers.simpleGroup(this.addressMinusSuffix).join(':');
        }
        assert(typeof this.elidedGroups === 'number');
        assert(typeof this.elisionBegin === 'number');
        // The elided case
        const output = [];
        const [left, right] = this.addressMinusSuffix.split('::');
        if (left.length) {
            output.push(...helpers.simpleGroup(left));
        } else {
            output.push('');
        }
        const classes = [
            'hover-group'
        ];
        for(let i = this.elisionBegin; i < this.elisionBegin + this.elidedGroups; i++){
            classes.push(`group-${i}`);
        }
        output.push(`<span class="${classes.join(' ')}"></span>`);
        if (right.length) {
            output.push(...helpers.simpleGroup(right, this.elisionEnd));
        } else {
            output.push('');
        }
        if (this.is4()) {
            assert(this.address4 instanceof ipv4_1.Address4);
            output.pop();
            output.push(this.address4.groupForV6());
        }
        return output.join(':');
    }
    // #endregion
    // #region Regular expressions
    /**
     * Generate a regular expression string that can be used to find or validate
     * all variations of this address
     * @param {boolean} substringSearch
     * @returns {string}
     */ regularExpressionString(substringSearch = false) {
        let output = [];
        // TODO: revisit why this is necessary
        const address6 = new Address6(this.correctForm());
        if (address6.elidedGroups === 0) {
            // The simple case
            output.push((0, regular_expressions_1.simpleRegularExpression)(address6.parsedAddress));
        } else if (address6.elidedGroups === constants6.GROUPS) {
            // A completely elided address
            output.push((0, regular_expressions_1.possibleElisions)(constants6.GROUPS));
        } else {
            // A partially elided address
            const halves = address6.address.split('::');
            if (halves[0].length) {
                output.push((0, regular_expressions_1.simpleRegularExpression)(halves[0].split(':')));
            }
            assert(typeof address6.elidedGroups === 'number');
            output.push((0, regular_expressions_1.possibleElisions)(address6.elidedGroups, halves[0].length !== 0, halves[1].length !== 0));
            if (halves[1].length) {
                output.push((0, regular_expressions_1.simpleRegularExpression)(halves[1].split(':')));
            }
            output = [
                output.join(':')
            ];
        }
        if (!substringSearch) {
            output = [
                '(?=^|',
                regular_expressions_1.ADDRESS_BOUNDARY,
                '|[^\\w\\:])(',
                ...output,
                ')(?=[^\\w\\:]|',
                regular_expressions_1.ADDRESS_BOUNDARY,
                '|$)'
            ];
        }
        return output.join('');
    }
    /**
     * Generate a regular expression that can be used to find or validate all
     * variations of this address.
     * @param {boolean} substringSearch
     * @returns {RegExp}
     */ regularExpression(substringSearch = false) {
        return new RegExp(this.regularExpressionString(substringSearch), 'i');
    }
}
exports.Address6 = Address6;
const TYPE_SUBNETS = Object.keys(constants6.TYPES).map((subnet)=>[
        new Address6(subnet),
        constants6.TYPES[subnet]
    ]);
const TEREDO_SUBNET = new Address6('2001::/32');
const SIX_TO_FOUR_SUBNET = new Address6('2002::/16');
const ULA_SUBNET = new Address6('fc00::/7');
const LINK_LOCAL_SUBNET = new Address6('fe80::/10');
const DOCUMENTATION_SUBNETS = [
    new Address6('2001:db8::/32'),
    new Address6('3fff::/20')
];
const BENCHMARKING_SUBNET = new Address6('2001:2::/48');
const GLOBAL_UNICAST_SUBNET = new Address6('2000::/3');
const SPECIAL_PURPOSE_V6 = constants6.SPECIAL_PURPOSE.map(([cidr, , reachable])=>({
        subnet: new Address6(cidr),
        reachable
    }));
const IPV4_MAPPED_SUBNET = new Address6('::ffff:0:0/96');
const NAT64_WELL_KNOWN_SUBNET = new Address6('64:ff9b::/96');
const NAT64_LOCAL_USE_SUBNET = new Address6('64:ff9b:1::/48'); //# sourceMappingURL=ipv6.js.map
}),
"[project]/node_modules/ip-address/dist/ip-address.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.v6 = exports.AddressError = exports.Address6 = exports.Address4 = void 0;
var ipv4_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/ipv4.js [app-route] (ecmascript)");
Object.defineProperty(exports, "Address4", {
    enumerable: true,
    get: function() {
        return ipv4_1.Address4;
    }
});
var ipv6_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/ipv6.js [app-route] (ecmascript)");
Object.defineProperty(exports, "Address6", {
    enumerable: true,
    get: function() {
        return ipv6_1.Address6;
    }
});
var address_error_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/address-error.js [app-route] (ecmascript)");
Object.defineProperty(exports, "AddressError", {
    enumerable: true,
    get: function() {
        return address_error_1.AddressError;
    }
});
const helpers = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/v6/helpers.js [app-route] (ecmascript)"));
exports.v6 = {
    helpers
}; //# sourceMappingURL=ip-address.js.map
}),
"[project]/node_modules/@cryptography/aes/dist/es/aes.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CTR",
    ()=>AES_IGE$1,
    "IGE",
    ()=>AES_IGE,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var S = new Uint8Array(256);
var Si = new Uint8Array(256);
var T1 = new Uint32Array(256);
var T2 = new Uint32Array(256);
var T3 = new Uint32Array(256);
var T4 = new Uint32Array(256);
var T5 = new Uint32Array(256);
var T6 = new Uint32Array(256);
var T7 = new Uint32Array(256);
var T8 = new Uint32Array(256);
function computeTables() {
    var d = new Uint8Array(256);
    var t = new Uint8Array(256);
    var x2;
    var x4;
    var x8;
    var s;
    var tEnc;
    var tDec;
    var x = 0;
    var xInv = 0;
    // Compute double and third tables
    for(var i = 0; i < 256; i++){
        d[i] = i << 1 ^ (i >> 7) * 283;
        t[d[i] ^ i] = i;
    }
    for(; !S[x]; x ^= x2 || 1){
        // Compute sbox
        s = xInv ^ xInv << 1 ^ xInv << 2 ^ xInv << 3 ^ xInv << 4;
        s = s >> 8 ^ s & 255 ^ 99;
        S[x] = s;
        Si[s] = x;
        // Compute MixColumns
        x8 = d[x4 = d[x2 = d[x]]];
        tDec = x8 * 0x1010101 ^ x4 * 0x10001 ^ x2 * 0x101 ^ x * 0x1010100;
        tEnc = d[s] * 0x101 ^ s * 0x1010100;
        T1[x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
        T2[x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
        T3[x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
        T4[x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
        T5[s] = tDec = tDec << 24 ^ tDec >>> 8;
        T6[s] = tDec = tDec << 24 ^ tDec >>> 8;
        T7[s] = tDec = tDec << 24 ^ tDec >>> 8;
        T8[s] = tDec = tDec << 24 ^ tDec >>> 8;
        xInv = t[xInv] || 1;
    }
}
/**
 * Gets a uint32 from string in big-endian order order
 */ function s2i(str, pos) {
    return str.charCodeAt(pos) << 24 ^ str.charCodeAt(pos + 1) << 16 ^ str.charCodeAt(pos + 2) << 8 ^ str.charCodeAt(pos + 3);
}
/* eslint-disable import/prefer-default-export */ /**
 * Helper function for transforming string key to Uint32Array
 */ function getWords(key) {
    if (key instanceof Uint32Array) {
        return key;
    }
    if (typeof key === 'string') {
        if (key.length % 4 !== 0) for(var i = key.length % 4; i <= 4; i++)key += '\0x00';
        var buf = new Uint32Array(key.length / 4);
        for(var i = 0; i < key.length; i += 4)buf[i / 4] = s2i(key, i);
        return buf;
    }
    if (key instanceof Uint8Array) {
        var buf = new Uint32Array(key.length / 4);
        for(var i = 0; i < key.length; i += 4){
            buf[i / 4] = key[i] << 24 ^ key[i + 1] << 16 ^ key[i + 2] << 8 ^ key[i + 3];
        }
        return buf;
    }
    throw new Error('Unable to create 32-bit words');
}
function xor(left, right, to) {
    if (to === void 0) {
        to = left;
    }
    for(var i = 0; i < left.length; i++)to[i] = left[i] ^ right[i];
}
computeTables();
/**
 * Low-level AES Cipher
 */ var AES = function() {
    function AES(_key) {
        var key = getWords(_key);
        if (key.length !== 4 && key.length !== 6 && key.length !== 8) {
            throw new Error('Invalid key size');
        }
        this.encKey = new Uint32Array(4 * key.length + 28);
        this.decKey = new Uint32Array(4 * key.length + 28);
        this.encKey.set(key);
        var rcon = 1;
        var i = key.length;
        var tmp;
        // schedule encryption keys
        for(; i < 4 * key.length + 28; i++){
            tmp = this.encKey[i - 1];
            // apply sbox
            if (i % key.length === 0 || key.length === 8 && i % key.length === 4) {
                tmp = S[tmp >>> 24] << 24 ^ S[tmp >> 16 & 255] << 16 ^ S[tmp >> 8 & 255] << 8 ^ S[tmp & 255];
                // shift rows and add rcon
                if (i % key.length === 0) {
                    tmp = tmp << 8 ^ tmp >>> 24 ^ rcon << 24;
                    rcon = rcon << 1 ^ (rcon >> 7) * 283;
                }
            }
            this.encKey[i] = this.encKey[i - key.length] ^ tmp;
        }
        // schedule decryption keys
        for(var j = 0; i; j++, i--){
            tmp = this.encKey[j & 3 ? i : i - 4];
            if (i <= 4 || j < 4) {
                this.decKey[j] = tmp;
            } else {
                this.decKey[j] = T5[S[tmp >>> 24]] ^ T6[S[tmp >> 16 & 255]] ^ T7[S[tmp >> 8 & 255]] ^ T8[S[tmp & 255]];
            }
        }
    }
    AES.prototype.encrypt = function(_message) {
        var message = getWords(_message);
        var out = new Uint32Array(4);
        var a = message[0] ^ this.encKey[0];
        var b = message[1] ^ this.encKey[1];
        var c = message[2] ^ this.encKey[2];
        var d = message[3] ^ this.encKey[3];
        var rounds = this.encKey.length / 4 - 2;
        var k = 4;
        var a2;
        var b2;
        var c2;
        // Inner rounds.  Cribbed from OpenSSL.
        for(var i = 0; i < rounds; i++){
            a2 = T1[a >>> 24] ^ T2[b >> 16 & 255] ^ T3[c >> 8 & 255] ^ T4[d & 255] ^ this.encKey[k];
            b2 = T1[b >>> 24] ^ T2[c >> 16 & 255] ^ T3[d >> 8 & 255] ^ T4[a & 255] ^ this.encKey[k + 1];
            c2 = T1[c >>> 24] ^ T2[d >> 16 & 255] ^ T3[a >> 8 & 255] ^ T4[b & 255] ^ this.encKey[k + 2];
            d = T1[d >>> 24] ^ T2[a >> 16 & 255] ^ T3[b >> 8 & 255] ^ T4[c & 255] ^ this.encKey[k + 3];
            a = a2;
            b = b2;
            c = c2;
            k += 4;
        // console.log(a, b, c, d);
        }
        // Last round.
        for(var i = 0; i < 4; i++){
            out[i] = S[a >>> 24] << 24 ^ S[b >> 16 & 255] << 16 ^ S[c >> 8 & 255] << 8 ^ S[d & 255] ^ this.encKey[k++];
            a2 = a;
            a = b;
            b = c;
            c = d;
            d = a2;
        }
        return out;
    };
    AES.prototype.decrypt = function(_message) {
        var message = getWords(_message);
        var out = new Uint32Array(4);
        var a = message[0] ^ this.decKey[0];
        var b = message[3] ^ this.decKey[1];
        var c = message[2] ^ this.decKey[2];
        var d = message[1] ^ this.decKey[3];
        var rounds = this.decKey.length / 4 - 2;
        var a2;
        var b2;
        var c2;
        var k = 4;
        // Inner rounds.  Cribbed from OpenSSL.
        for(var i = 0; i < rounds; i++){
            a2 = T5[a >>> 24] ^ T6[b >> 16 & 255] ^ T7[c >> 8 & 255] ^ T8[d & 255] ^ this.decKey[k];
            b2 = T5[b >>> 24] ^ T6[c >> 16 & 255] ^ T7[d >> 8 & 255] ^ T8[a & 255] ^ this.decKey[k + 1];
            c2 = T5[c >>> 24] ^ T6[d >> 16 & 255] ^ T7[a >> 8 & 255] ^ T8[b & 255] ^ this.decKey[k + 2];
            d = T5[d >>> 24] ^ T6[a >> 16 & 255] ^ T7[b >> 8 & 255] ^ T8[c & 255] ^ this.decKey[k + 3];
            a = a2;
            b = b2;
            c = c2;
            k += 4;
        }
        // Last round.
        for(var i = 0; i < 4; i++){
            out[3 & -i] = Si[a >>> 24] << 24 ^ Si[b >> 16 & 255] << 16 ^ Si[c >> 8 & 255] << 8 ^ Si[d & 255] ^ this.decKey[k++];
            a2 = a;
            a = b;
            b = c;
            c = d;
            d = a2;
        }
        return out;
    };
    return AES;
}();
/**
 * AES-IGE mode.
 */ var AES_IGE = function() {
    function AES_IGE(key, iv, blockSize) {
        if (blockSize === void 0) {
            blockSize = 16;
        }
        this.key = getWords(key);
        this.iv = getWords(iv);
        this.cipher = new AES(key);
        this.blockSize = blockSize / 4;
    }
    /**
     * Encrypts plain text with AES-IGE mode.
     */ AES_IGE.prototype.encrypt = function(message, buf) {
        var text = getWords(message);
        var cipherText = buf || new Uint32Array(text.length);
        var prevX = this.iv.subarray(this.blockSize, this.iv.length);
        var prevY = this.iv.subarray(0, this.blockSize);
        var yXOR = new Uint32Array(this.blockSize);
        for(var i = 0; i < text.length; i += this.blockSize){
            var x = text.subarray(i, i + this.blockSize);
            xor(x, prevY, yXOR);
            var y = this.cipher.encrypt(yXOR);
            xor(y, prevX);
            prevX = x;
            prevY = y;
            for(var j = i, k = 0; j < text.length && k < 4; j++, k++)cipherText[j] = y[k];
        }
        return cipherText;
    };
    /**
     * Decrypts cipher text with AES-IGE mode.
     */ AES_IGE.prototype.decrypt = function(message, buf) {
        var cipherText = getWords(message);
        var text = buf || new Uint32Array(cipherText.length);
        var prevY = this.iv.subarray(this.blockSize, this.iv.length);
        var prevX = this.iv.subarray(0, this.blockSize);
        var yXOR = new Uint32Array(this.blockSize);
        for(var i = 0; i < text.length; i += this.blockSize){
            var x = cipherText.subarray(i, i + this.blockSize);
            xor(x, prevY, yXOR);
            var y = this.cipher.decrypt(yXOR);
            xor(y, prevX);
            prevX = x;
            prevY = y;
            for(var j = i, k = 0; j < text.length && k < 4; j++, k++)text[j] = y[k];
        }
        return text;
    };
    return AES_IGE;
}();
/**
 * AES-IGE mode.
 */ var AES_IGE$1 = function() {
    function AES_IGE(key, counter, blockSize) {
        if (blockSize === void 0) {
            blockSize = 16;
        }
        this.offset = 0;
        this.key = getWords(key);
        this.counter = getWords(counter);
        this.cipher = new AES(key);
        this.blockSize = blockSize / 4;
        if (this.counter.length !== 4) {
            throw new Error('AES-CTR mode counter must be 16 bytes length');
        }
    }
    /**
     * Encrypts plain text with AES-IGE mode.
     */ AES_IGE.prototype.encrypt = function(message, buf) {
        var text = getWords(message);
        var cipherText = buf || new Uint32Array(text.length);
        var offset = this.offset;
        for(var i = 0; i < text.length; i += this.blockSize){
            var x = this.cipher.encrypt(this.counter);
            for(var j = i, k = offset; j < text.length && k < this.blockSize; j++, k++)cipherText[j] = x[k] ^ text[j];
            if (text.length - i >= this.blockSize) this.incrementCounter();
            if (offset) {
                i -= offset;
                offset = 0;
            }
        }
        this.offset = (this.offset + text.length % 4) % 4;
        return cipherText;
    };
    /**
     * Decrypts cipher text with AES-IGE mode.
     */ AES_IGE.prototype.decrypt = function(message, buf) {
        return this.encrypt(message, buf);
    };
    AES_IGE.prototype.incrementCounter = function() {
        // increment counter
        for(var carry = this.counter.length - 1; carry >= 0; carry--){
            if (++this.counter[carry] < 0xFFFFFFFF) break; // If overflowing, it'll be 0 and we'll have to continue propagating the carry
        }
    };
    return AES_IGE;
}();
const __TURBOPACK__default__export__ = AES;
;
}),
"[project]/node_modules/store2/dist/store2.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/*! store2 - v2.14.4 - 2024-12-26
* Copyright (c) 2024 Nathan Bubna; Licensed MIT */ ;
(function(window, define) {
    var _ = {
        version: "2.14.4",
        areas: {},
        apis: {},
        nsdelim: '.',
        // utilities
        inherit: function(api, o) {
            for(var p in api){
                if (!o.hasOwnProperty(p)) {
                    Object.defineProperty(o, p, Object.getOwnPropertyDescriptor(api, p));
                }
            }
            return o;
        },
        stringify: function(d, fn) {
            return d === undefined || typeof d === "function" ? d + '' : JSON.stringify(d, fn || _.replace);
        },
        parse: function(s, fn) {
            // if it doesn't parse, return as is
            try {
                return JSON.parse(s, fn || _.revive);
            } catch (e) {
                return s;
            }
        },
        // extension hooks
        fn: function(name, fn) {
            _.storeAPI[name] = fn;
            for(var api in _.apis){
                _.apis[api][name] = fn;
            }
        },
        get: function(area, key) {
            return area.getItem(key);
        },
        set: function(area, key, string) {
            area.setItem(key, string);
        },
        remove: function(area, key) {
            area.removeItem(key);
        },
        key: function(area, i) {
            return area.key(i);
        },
        length: function(area) {
            return area.length;
        },
        clear: function(area) {
            area.clear();
        },
        // core functions
        Store: function(id, area, namespace) {
            var store = _.inherit(_.storeAPI, function(key, data, overwrite) {
                if (arguments.length === 0) {
                    return store.getAll();
                }
                if (typeof data === "function") {
                    return store.transact(key, data, overwrite);
                } // fn=data, alt=overwrite
                if (data !== undefined) {
                    return store.set(key, data, overwrite);
                }
                if (typeof key === "string" || typeof key === "number") {
                    return store.get(key);
                }
                if (typeof key === "function") {
                    return store.each(key);
                }
                if (!key) {
                    return store.clear();
                }
                return store.setAll(key, data); // overwrite=data, data=key
            });
            store._id = id;
            try {
                var testKey = '__store2_test';
                area.setItem(testKey, 'ok');
                store._area = area;
                area.removeItem(testKey);
            } catch (e) {
                store._area = _.storage('fake');
            }
            store._ns = namespace || '';
            if (!_.areas[id]) {
                _.areas[id] = store._area;
            }
            if (!_.apis[store._ns + store._id]) {
                _.apis[store._ns + store._id] = store;
            }
            return store;
        },
        storeAPI: {
            // admin functions
            area: function(id, area) {
                var store = this[id];
                if (!store || !store.area) {
                    store = _.Store(id, area, this._ns); //new area-specific api in this namespace
                    if (!this[id]) {
                        this[id] = store;
                    }
                }
                return store;
            },
            namespace: function(namespace, singleArea, delim) {
                delim = delim || this._delim || _.nsdelim;
                if (!namespace) {
                    return this._ns ? this._ns.substring(0, this._ns.length - delim.length) : '';
                }
                var ns = namespace, store = this[ns];
                if (!store || !store.namespace) {
                    store = _.Store(this._id, this._area, this._ns + ns + delim); //new namespaced api
                    store._delim = delim;
                    if (!this[ns]) {
                        this[ns] = store;
                    }
                    if (!singleArea) {
                        for(var name in _.areas){
                            store.area(name, _.areas[name]);
                        }
                    }
                }
                return store;
            },
            isFake: function(force) {
                if (force) {
                    this._real = this._area;
                    this._area = _.storage('fake');
                } else if (force === false) {
                    this._area = this._real || this._area;
                }
                return this._area.name === 'fake';
            },
            toString: function() {
                return 'store' + (this._ns ? '.' + this.namespace() : '') + '[' + this._id + ']';
            },
            // storage functions
            has: function(key) {
                if (this._area.has) {
                    return this._area.has(this._in(key)); //extension hook
                }
                return !!(this._in(key) in this._area);
            },
            size: function() {
                return this.keys().length;
            },
            each: function(fn, fill) {
                for(var i = 0, m = _.length(this._area); i < m; i++){
                    var key = this._out(_.key(this._area, i));
                    if (key !== undefined) {
                        if (fn.call(this, key, this.get(key), fill) === false) {
                            break;
                        }
                    }
                    if (m > _.length(this._area)) {
                        m--;
                        i--;
                    } // in case of removeItem
                }
                return fill || this;
            },
            keys: function(fillList) {
                return this.each(function(k, v, list) {
                    list.push(k);
                }, fillList || []);
            },
            get: function(key, alt) {
                var s = _.get(this._area, this._in(key)), fn;
                if (typeof alt === "function") {
                    fn = alt;
                    alt = null;
                }
                return s !== null ? _.parse(s, fn) : alt != null ? alt : s;
            },
            getAll: function(fillObj) {
                return this.each(function(k, v, all) {
                    all[k] = v;
                }, fillObj || {});
            },
            transact: function(key, fn, alt) {
                var val = this.get(key, alt), ret = fn(val);
                this.set(key, ret === undefined ? val : ret);
                return this;
            },
            set: function(key, data, overwrite) {
                var d = this.get(key), replacer;
                if (d != null && overwrite === false) {
                    return data;
                }
                if (typeof overwrite === "function") {
                    replacer = overwrite;
                    overwrite = undefined;
                }
                return _.set(this._area, this._in(key), _.stringify(data, replacer), overwrite) || d;
            },
            setAll: function(data, overwrite) {
                var changed, val;
                for(var key in data){
                    val = data[key];
                    if (this.set(key, val, overwrite) !== val) {
                        changed = true;
                    }
                }
                return changed;
            },
            add: function(key, data, replacer) {
                var d = this.get(key);
                if (d instanceof Array) {
                    data = d.concat(data);
                } else if (d !== null) {
                    var type = typeof d;
                    if (type === typeof data && type === 'object') {
                        for(var k in data){
                            d[k] = data[k];
                        }
                        data = d;
                    } else {
                        data = d + data;
                    }
                }
                _.set(this._area, this._in(key), _.stringify(data, replacer));
                return data;
            },
            remove: function(key, alt) {
                var d = this.get(key, alt);
                _.remove(this._area, this._in(key));
                return d;
            },
            clear: function() {
                if (!this._ns) {
                    _.clear(this._area);
                } else {
                    this.each(function(k) {
                        _.remove(this._area, this._in(k));
                    }, 1);
                }
                return this;
            },
            clearAll: function() {
                var area = this._area;
                for(var id in _.areas){
                    if (_.areas.hasOwnProperty(id)) {
                        this._area = _.areas[id];
                        this.clear();
                    }
                }
                this._area = area;
                return this;
            },
            // internal use functions
            _in: function(k) {
                if (typeof k !== "string") {
                    k = _.stringify(k);
                }
                return this._ns ? this._ns + k : k;
            },
            _out: function(k) {
                return this._ns ? k && k.indexOf(this._ns) === 0 ? k.substring(this._ns.length) : undefined : k;
            }
        },
        storage: function(name) {
            return _.inherit(_.storageAPI, {
                items: {},
                name: name
            });
        },
        storageAPI: {
            length: 0,
            has: function(k) {
                return this.items.hasOwnProperty(k);
            },
            key: function(i) {
                var c = 0;
                for(var k in this.items){
                    if (this.has(k) && i === c++) {
                        return k;
                    }
                }
            },
            setItem: function(k, v) {
                if (!this.has(k)) {
                    this.length++;
                }
                this.items[k] = v;
            },
            removeItem: function(k) {
                if (this.has(k)) {
                    delete this.items[k];
                    this.length--;
                }
            },
            getItem: function(k) {
                return this.has(k) ? this.items[k] : null;
            },
            clear: function() {
                for(var k in this.items){
                    this.removeItem(k);
                }
            }
        } // end _.storageAPI
    };
    var store = // safely set this up (throws error in IE10/32bit mode for local files)
    _.Store("local", function() {
        try {
            return localStorage;
        } catch (e) {}
    }());
    store.local = store; // for completeness
    store._ = _; // for extenders and debuggers...
    // safely setup store.session (throws exception in FF for file:/// urls)
    store.area("session", function() {
        try {
            return sessionStorage;
        } catch (e) {}
    }());
    store.area("page", _.storage("page"));
    if (typeof define === 'function' && define.amd !== undefined) {
        define('store2', [], function() {
            return store;
        });
    } else if (("TURBOPACK compile-time value", "object") !== 'undefined' && module.exports) {
        module.exports = store;
    } else {
        // expose the primary store fn to the global object and save conflicts
        if (window.store) {
            _.conflict = window.store;
        }
        window.store = store;
    }
})(/*TURBOPACK member replacement*/ __turbopack_context__.e, /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.define);
}),
"[project]/node_modules/graceful-fs/polyfills.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var constants = __turbopack_context__.r("[externals]/constants [external] (constants, cjs)");
var origCwd = process.cwd;
var cwd = null;
var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
    if (!cwd) cwd = origCwd.call(process);
    return cwd;
};
try {
    process.cwd();
} catch (er) {}
// This check is needed until node.js 12 is required
if (typeof process.chdir === 'function') {
    var chdir = process.chdir;
    process.chdir = function(d) {
        cwd = null;
        chdir.call(process, d);
    };
    if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
}
module.exports = patch;
function patch(fs) {
    // (re-)implement some things that are known busted or missing.
    // lchmod, broken prior to 0.6.2
    // back-port the fix here.
    if (constants.hasOwnProperty('O_SYMLINK') && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
        patchLchmod(fs);
    }
    // lutimes implementation, or no-op
    if (!fs.lutimes) {
        patchLutimes(fs);
    }
    // https://github.com/isaacs/node-graceful-fs/issues/4
    // Chown should not fail on einval or eperm if non-root.
    // It should not fail on enosys ever, as this just indicates
    // that a fs doesn't support the intended operation.
    fs.chown = chownFix(fs.chown);
    fs.fchown = chownFix(fs.fchown);
    fs.lchown = chownFix(fs.lchown);
    fs.chmod = chmodFix(fs.chmod);
    fs.fchmod = chmodFix(fs.fchmod);
    fs.lchmod = chmodFix(fs.lchmod);
    fs.chownSync = chownFixSync(fs.chownSync);
    fs.fchownSync = chownFixSync(fs.fchownSync);
    fs.lchownSync = chownFixSync(fs.lchownSync);
    fs.chmodSync = chmodFixSync(fs.chmodSync);
    fs.fchmodSync = chmodFixSync(fs.fchmodSync);
    fs.lchmodSync = chmodFixSync(fs.lchmodSync);
    fs.stat = statFix(fs.stat);
    fs.fstat = statFix(fs.fstat);
    fs.lstat = statFix(fs.lstat);
    fs.statSync = statFixSync(fs.statSync);
    fs.fstatSync = statFixSync(fs.fstatSync);
    fs.lstatSync = statFixSync(fs.lstatSync);
    // if lchmod/lchown do not exist, then make them no-ops
    if (fs.chmod && !fs.lchmod) {
        fs.lchmod = function(path, mode, cb) {
            if (cb) process.nextTick(cb);
        };
        fs.lchmodSync = function() {};
    }
    if (fs.chown && !fs.lchown) {
        fs.lchown = function(path, uid, gid, cb) {
            if (cb) process.nextTick(cb);
        };
        fs.lchownSync = function() {};
    }
    // on Windows, A/V software can lock the directory, causing this
    // to fail with an EACCES or EPERM if the directory contains newly
    // created files.  Try again on failure, for up to 60 seconds.
    // Set the timeout this long because some Windows Anti-Virus, such as Parity
    // bit9, may lock files for up to a minute, causing npm package install
    // failures. Also, take care to yield the scheduler. Windows scheduling gives
    // CPU to a busy looping process, which can cause the program causing the lock
    // contention to be starved of CPU by node, so the contention doesn't resolve.
    if (platform === "win32") {
        fs.rename = typeof fs.rename !== 'function' ? fs.rename : function(fs$rename) {
            function rename(from, to, cb) {
                var start = Date.now();
                var backoff = 0;
                fs$rename(from, to, function CB(er) {
                    if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 60000) {
                        setTimeout(function() {
                            fs.stat(to, function(stater, st) {
                                if (stater && stater.code === "ENOENT") fs$rename(from, to, CB);
                                else cb(er);
                            });
                        }, backoff);
                        if (backoff < 100) backoff += 10;
                        return;
                    }
                    if (cb) cb(er);
                });
            }
            if (Object.setPrototypeOf) Object.setPrototypeOf(rename, fs$rename);
            return rename;
        }(fs.rename);
    }
    // if read() returns EAGAIN, then just try it again.
    fs.read = typeof fs.read !== 'function' ? fs.read : function(fs$read) {
        function read(fd, buffer, offset, length, position, callback_) {
            var callback;
            if (callback_ && typeof callback_ === 'function') {
                var eagCounter = 0;
                callback = function(er, _, __) {
                    if (er && er.code === 'EAGAIN' && eagCounter < 10) {
                        eagCounter++;
                        return fs$read.call(fs, fd, buffer, offset, length, position, callback);
                    }
                    callback_.apply(this, arguments);
                };
            }
            return fs$read.call(fs, fd, buffer, offset, length, position, callback);
        }
        // This ensures `util.promisify` works as it does for native `fs.read`.
        if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
        return read;
    }(fs.read);
    fs.readSync = typeof fs.readSync !== 'function' ? fs.readSync : function(fs$readSync) {
        return function(fd, buffer, offset, length, position) {
            var eagCounter = 0;
            while(true){
                try {
                    return fs$readSync.call(fs, fd, buffer, offset, length, position);
                } catch (er) {
                    if (er.code === 'EAGAIN' && eagCounter < 10) {
                        eagCounter++;
                        continue;
                    }
                    throw er;
                }
            }
        };
    }(fs.readSync);
    function patchLchmod(fs) {
        fs.lchmod = function(path, mode, callback) {
            fs.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, function(err, fd) {
                if (err) {
                    if (callback) callback(err);
                    return;
                }
                // prefer to return the chmod error, if one occurs,
                // but still try to close, and report closing errors if they occur.
                fs.fchmod(fd, mode, function(err) {
                    fs.close(fd, function(err2) {
                        if (callback) callback(err || err2);
                    });
                });
            });
        };
        fs.lchmodSync = function(path, mode) {
            var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
            // prefer to return the chmod error, if one occurs,
            // but still try to close, and report closing errors if they occur.
            var threw = true;
            var ret;
            try {
                ret = fs.fchmodSync(fd, mode);
                threw = false;
            } finally{
                if (threw) {
                    try {
                        fs.closeSync(fd);
                    } catch (er) {}
                } else {
                    fs.closeSync(fd);
                }
            }
            return ret;
        };
    }
    function patchLutimes(fs) {
        if (constants.hasOwnProperty("O_SYMLINK") && fs.futimes) {
            fs.lutimes = function(path, at, mt, cb) {
                fs.open(path, constants.O_SYMLINK, function(er, fd) {
                    if (er) {
                        if (cb) cb(er);
                        return;
                    }
                    fs.futimes(fd, at, mt, function(er) {
                        fs.close(fd, function(er2) {
                            if (cb) cb(er || er2);
                        });
                    });
                });
            };
            fs.lutimesSync = function(path, at, mt) {
                var fd = fs.openSync(path, constants.O_SYMLINK);
                var ret;
                var threw = true;
                try {
                    ret = fs.futimesSync(fd, at, mt);
                    threw = false;
                } finally{
                    if (threw) {
                        try {
                            fs.closeSync(fd);
                        } catch (er) {}
                    } else {
                        fs.closeSync(fd);
                    }
                }
                return ret;
            };
        } else if (fs.futimes) {
            fs.lutimes = function(_a, _b, _c, cb) {
                if (cb) process.nextTick(cb);
            };
            fs.lutimesSync = function() {};
        }
    }
    function chmodFix(orig) {
        if (!orig) return orig;
        return function(target, mode, cb) {
            return orig.call(fs, target, mode, function(er) {
                if (chownErOk(er)) er = null;
                if (cb) cb.apply(this, arguments);
            });
        };
    }
    function chmodFixSync(orig) {
        if (!orig) return orig;
        return function(target, mode) {
            try {
                return orig.call(fs, target, mode);
            } catch (er) {
                if (!chownErOk(er)) throw er;
            }
        };
    }
    function chownFix(orig) {
        if (!orig) return orig;
        return function(target, uid, gid, cb) {
            return orig.call(fs, target, uid, gid, function(er) {
                if (chownErOk(er)) er = null;
                if (cb) cb.apply(this, arguments);
            });
        };
    }
    function chownFixSync(orig) {
        if (!orig) return orig;
        return function(target, uid, gid) {
            try {
                return orig.call(fs, target, uid, gid);
            } catch (er) {
                if (!chownErOk(er)) throw er;
            }
        };
    }
    function statFix(orig) {
        if (!orig) return orig;
        // Older versions of Node erroneously returned signed integers for
        // uid + gid.
        return function(target, options, cb) {
            if (typeof options === 'function') {
                cb = options;
                options = null;
            }
            function callback(er, stats) {
                if (stats) {
                    if (stats.uid < 0) stats.uid += 0x100000000;
                    if (stats.gid < 0) stats.gid += 0x100000000;
                }
                if (cb) cb.apply(this, arguments);
            }
            return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
        };
    }
    function statFixSync(orig) {
        if (!orig) return orig;
        // Older versions of Node erroneously returned signed integers for
        // uid + gid.
        return function(target, options) {
            var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
            if (stats) {
                if (stats.uid < 0) stats.uid += 0x100000000;
                if (stats.gid < 0) stats.gid += 0x100000000;
            }
            return stats;
        };
    }
    // ENOSYS means that the fs doesn't support the op. Just ignore
    // that, because it doesn't matter.
    //
    // if there's no getuid, or if getuid() is something other
    // than 0, and the error is EINVAL or EPERM, then just ignore
    // it.
    //
    // This specific case is a silent failure in cp, install, tar,
    // and most other unix tools that manage permissions.
    //
    // When running as root, or if other types of errors are
    // encountered, then it's strict.
    function chownErOk(er) {
        if (!er) return true;
        if (er.code === "ENOSYS") return true;
        var nonroot = !process.getuid || process.getuid() !== 0;
        if (nonroot) {
            if (er.code === "EINVAL" || er.code === "EPERM") return true;
        }
        return false;
    }
}
}),
"[project]/node_modules/graceful-fs/legacy-streams.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var Stream = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").Stream;
module.exports = legacy;
function legacy(fs) {
    return {
        ReadStream: ReadStream,
        WriteStream: WriteStream
    };
    //TURBOPACK unreachable
    ;
    function ReadStream(path, options) {
        if (!(this instanceof ReadStream)) return new ReadStream(path, options);
        Stream.call(this);
        var self = this;
        this.path = path;
        this.fd = null;
        this.readable = true;
        this.paused = false;
        this.flags = 'r';
        this.mode = 438; /*=0666*/ 
        this.bufferSize = 64 * 1024;
        options = options || {};
        // Mixin options into this
        var keys = Object.keys(options);
        for(var index = 0, length = keys.length; index < length; index++){
            var key = keys[index];
            this[key] = options[key];
        }
        if (this.encoding) this.setEncoding(this.encoding);
        if (this.start !== undefined) {
            if ('number' !== typeof this.start) {
                throw TypeError('start must be a Number');
            }
            if (this.end === undefined) {
                this.end = Infinity;
            } else if ('number' !== typeof this.end) {
                throw TypeError('end must be a Number');
            }
            if (this.start > this.end) {
                throw new Error('start must be <= end');
            }
            this.pos = this.start;
        }
        if (this.fd !== null) {
            process.nextTick(function() {
                self._read();
            });
            return;
        }
        fs.open(this.path, this.flags, this.mode, function(err, fd) {
            if (err) {
                self.emit('error', err);
                self.readable = false;
                return;
            }
            self.fd = fd;
            self.emit('open', fd);
            self._read();
        });
    }
    function WriteStream(path, options) {
        if (!(this instanceof WriteStream)) return new WriteStream(path, options);
        Stream.call(this);
        this.path = path;
        this.fd = null;
        this.writable = true;
        this.flags = 'w';
        this.encoding = 'binary';
        this.mode = 438; /*=0666*/ 
        this.bytesWritten = 0;
        options = options || {};
        // Mixin options into this
        var keys = Object.keys(options);
        for(var index = 0, length = keys.length; index < length; index++){
            var key = keys[index];
            this[key] = options[key];
        }
        if (this.start !== undefined) {
            if ('number' !== typeof this.start) {
                throw TypeError('start must be a Number');
            }
            if (this.start < 0) {
                throw new Error('start must be >= zero');
            }
            this.pos = this.start;
        }
        this.busy = false;
        this._queue = [];
        if (this.fd === null) {
            this._open = fs.open;
            this._queue.push([
                this._open,
                this.path,
                this.flags,
                this.mode,
                undefined
            ]);
            this.flush();
        }
    }
}
}),
"[project]/node_modules/graceful-fs/clone.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = clone;
var getPrototypeOf = Object.getPrototypeOf || function(obj) {
    return obj.__proto__;
};
function clone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Object) var copy = {
        __proto__: getPrototypeOf(obj)
    };
    else var copy = Object.create(null);
    Object.getOwnPropertyNames(obj).forEach(function(key) {
        Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
    });
    return copy;
}
}),
"[project]/node_modules/graceful-fs/graceful-fs.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
var polyfills = __turbopack_context__.r("[project]/node_modules/graceful-fs/polyfills.js [app-route] (ecmascript)");
var legacy = __turbopack_context__.r("[project]/node_modules/graceful-fs/legacy-streams.js [app-route] (ecmascript)");
var clone = __turbopack_context__.r("[project]/node_modules/graceful-fs/clone.js [app-route] (ecmascript)");
var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
/* istanbul ignore next - node 0.x polyfill */ var gracefulQueue;
var previousSymbol;
/* istanbul ignore else - node 0.x polyfill */ if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
    gracefulQueue = Symbol.for('graceful-fs.queue');
    // This is used in testing by future versions
    previousSymbol = Symbol.for('graceful-fs.previous');
} else {
    gracefulQueue = '___graceful-fs.queue';
    previousSymbol = '___graceful-fs.previous';
}
function noop() {}
function publishQueue(context, queue) {
    Object.defineProperty(context, gracefulQueue, {
        get: function() {
            return queue;
        }
    });
}
var debug = noop;
if (util.debuglog) debug = util.debuglog('gfs4');
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) debug = function() {
    var m = util.format.apply(util, arguments);
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ');
    console.error(m);
};
// Once time initialization
if (!fs[gracefulQueue]) {
    // This queue can be shared by multiple loaded instances
    var queue = /*TURBOPACK member replacement*/ __turbopack_context__.g[gracefulQueue] || [];
    publishQueue(fs, queue);
    // Patch fs.close/closeSync to shared queue version, because we need
    // to retry() whenever a close happens *anywhere* in the program.
    // This is essential when multiple graceful-fs instances are
    // in play at the same time.
    fs.close = function(fs$close) {
        function close(fd, cb) {
            return fs$close.call(fs, fd, function(err) {
                // This function uses the graceful-fs shared queue
                if (!err) {
                    resetQueue();
                }
                if (typeof cb === 'function') cb.apply(this, arguments);
            });
        }
        Object.defineProperty(close, previousSymbol, {
            value: fs$close
        });
        return close;
    }(fs.close);
    fs.closeSync = function(fs$closeSync) {
        function closeSync(fd) {
            // This function uses the graceful-fs shared queue
            fs$closeSync.apply(fs, arguments);
            resetQueue();
        }
        Object.defineProperty(closeSync, previousSymbol, {
            value: fs$closeSync
        });
        return closeSync;
    }(fs.closeSync);
    if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
        process.on('exit', function() {
            debug(fs[gracefulQueue]);
            __turbopack_context__.r("[externals]/assert [external] (assert, cjs)").equal(fs[gracefulQueue].length, 0);
        });
    }
}
if (!/*TURBOPACK member replacement*/ __turbopack_context__.g[gracefulQueue]) {
    publishQueue(/*TURBOPACK member replacement*/ __turbopack_context__.g, fs[gracefulQueue]);
}
module.exports = patch(clone(fs));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
    module.exports = patch(fs);
    fs.__patched = true;
}
function patch(fs) {
    // Everything that references the open() function needs to be in here
    polyfills(fs);
    fs.gracefulify = patch;
    fs.createReadStream = createReadStream;
    fs.createWriteStream = createWriteStream;
    var fs$readFile = fs.readFile;
    fs.readFile = readFile;
    function readFile(path, options, cb) {
        if (typeof options === 'function') cb = options, options = null;
        return go$readFile(path, options, cb);
        //TURBOPACK unreachable
        ;
        function go$readFile(path, options, cb, startTime) {
            return fs$readFile(path, options, function(err) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$readFile,
                    [
                        path,
                        options,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else {
                    if (typeof cb === 'function') cb.apply(this, arguments);
                }
            });
        }
    }
    var fs$writeFile = fs.writeFile;
    fs.writeFile = writeFile;
    function writeFile(path, data, options, cb) {
        if (typeof options === 'function') cb = options, options = null;
        return go$writeFile(path, data, options, cb);
        //TURBOPACK unreachable
        ;
        function go$writeFile(path, data, options, cb, startTime) {
            return fs$writeFile(path, data, options, function(err) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$writeFile,
                    [
                        path,
                        data,
                        options,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else {
                    if (typeof cb === 'function') cb.apply(this, arguments);
                }
            });
        }
    }
    var fs$appendFile = fs.appendFile;
    if (fs$appendFile) fs.appendFile = appendFile;
    function appendFile(path, data, options, cb) {
        if (typeof options === 'function') cb = options, options = null;
        return go$appendFile(path, data, options, cb);
        //TURBOPACK unreachable
        ;
        function go$appendFile(path, data, options, cb, startTime) {
            return fs$appendFile(path, data, options, function(err) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$appendFile,
                    [
                        path,
                        data,
                        options,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else {
                    if (typeof cb === 'function') cb.apply(this, arguments);
                }
            });
        }
    }
    var fs$copyFile = fs.copyFile;
    if (fs$copyFile) fs.copyFile = copyFile;
    function copyFile(src, dest, flags, cb) {
        if (typeof flags === 'function') {
            cb = flags;
            flags = 0;
        }
        return go$copyFile(src, dest, flags, cb);
        //TURBOPACK unreachable
        ;
        function go$copyFile(src, dest, flags, cb, startTime) {
            return fs$copyFile(src, dest, flags, function(err) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$copyFile,
                    [
                        src,
                        dest,
                        flags,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else {
                    if (typeof cb === 'function') cb.apply(this, arguments);
                }
            });
        }
    }
    var fs$readdir = fs.readdir;
    fs.readdir = readdir;
    var noReaddirOptionVersions = /^v[0-5]\./;
    function readdir(path, options, cb) {
        if (typeof options === 'function') cb = options, options = null;
        var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir(path, options, cb, startTime) {
            return fs$readdir(path, fs$readdirCallback(path, options, cb, startTime));
        } : function go$readdir(path, options, cb, startTime) {
            return fs$readdir(path, options, fs$readdirCallback(path, options, cb, startTime));
        };
        return go$readdir(path, options, cb);
        //TURBOPACK unreachable
        ;
        function fs$readdirCallback(path, options, cb, startTime) {
            return function(err, files) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$readdir,
                    [
                        path,
                        options,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else {
                    if (files && files.sort) files.sort();
                    if (typeof cb === 'function') cb.call(this, err, files);
                }
            };
        }
    }
    if (process.version.substr(0, 4) === 'v0.8') {
        var legStreams = legacy(fs);
        ReadStream = legStreams.ReadStream;
        WriteStream = legStreams.WriteStream;
    }
    var fs$ReadStream = fs.ReadStream;
    if (fs$ReadStream) {
        ReadStream.prototype = Object.create(fs$ReadStream.prototype);
        ReadStream.prototype.open = ReadStream$open;
    }
    var fs$WriteStream = fs.WriteStream;
    if (fs$WriteStream) {
        WriteStream.prototype = Object.create(fs$WriteStream.prototype);
        WriteStream.prototype.open = WriteStream$open;
    }
    Object.defineProperty(fs, 'ReadStream', {
        get: function() {
            return ReadStream;
        },
        set: function(val) {
            ReadStream = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(fs, 'WriteStream', {
        get: function() {
            return WriteStream;
        },
        set: function(val) {
            WriteStream = val;
        },
        enumerable: true,
        configurable: true
    });
    // legacy names
    var FileReadStream = ReadStream;
    Object.defineProperty(fs, 'FileReadStream', {
        get: function() {
            return FileReadStream;
        },
        set: function(val) {
            FileReadStream = val;
        },
        enumerable: true,
        configurable: true
    });
    var FileWriteStream = WriteStream;
    Object.defineProperty(fs, 'FileWriteStream', {
        get: function() {
            return FileWriteStream;
        },
        set: function(val) {
            FileWriteStream = val;
        },
        enumerable: true,
        configurable: true
    });
    function ReadStream(path, options) {
        if (this instanceof ReadStream) return fs$ReadStream.apply(this, arguments), this;
        else return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
    }
    function ReadStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
            if (err) {
                if (that.autoClose) that.destroy();
                that.emit('error', err);
            } else {
                that.fd = fd;
                that.emit('open', fd);
                that.read();
            }
        });
    }
    function WriteStream(path, options) {
        if (this instanceof WriteStream) return fs$WriteStream.apply(this, arguments), this;
        else return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
    }
    function WriteStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
            if (err) {
                that.destroy();
                that.emit('error', err);
            } else {
                that.fd = fd;
                that.emit('open', fd);
            }
        });
    }
    function createReadStream(path, options) {
        return new fs.ReadStream(path, options);
    }
    function createWriteStream(path, options) {
        return new fs.WriteStream(path, options);
    }
    var fs$open = fs.open;
    fs.open = open;
    function open(path, flags, mode, cb) {
        if (typeof mode === 'function') cb = mode, mode = null;
        return go$open(path, flags, mode, cb);
        //TURBOPACK unreachable
        ;
        function go$open(path, flags, mode, cb, startTime) {
            return fs$open(path, flags, mode, function(err, fd) {
                if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) enqueue([
                    go$open,
                    [
                        path,
                        flags,
                        mode,
                        cb
                    ],
                    err,
                    startTime || Date.now(),
                    Date.now()
                ]);
                else {
                    if (typeof cb === 'function') cb.apply(this, arguments);
                }
            });
        }
    }
    return fs;
}
function enqueue(elem) {
    debug('ENQUEUE', elem[0].name, elem[1]);
    fs[gracefulQueue].push(elem);
    retry();
}
// keep track of the timeout between retry() calls
var retryTimer;
// reset the startTime and lastTime to now
// this resets the start of the 60 second overall timeout as well as the
// delay between attempts so that we'll retry these jobs sooner
function resetQueue() {
    var now = Date.now();
    for(var i = 0; i < fs[gracefulQueue].length; ++i){
        // entries that are only a length of 2 are from an older version, don't
        // bother modifying those since they'll be retried anyway.
        if (fs[gracefulQueue][i].length > 2) {
            fs[gracefulQueue][i][3] = now; // startTime
            fs[gracefulQueue][i][4] = now; // lastTime
        }
    }
    // call retry to make sure we're actively processing the queue
    retry();
}
function retry() {
    // clear the timer and remove it to help prevent unintended concurrency
    clearTimeout(retryTimer);
    retryTimer = undefined;
    if (fs[gracefulQueue].length === 0) return;
    var elem = fs[gracefulQueue].shift();
    var fn = elem[0];
    var args = elem[1];
    // these items may be unset if they were added by an older graceful-fs
    var err = elem[2];
    var startTime = elem[3];
    var lastTime = elem[4];
    // if we don't have a startTime we have no way of knowing if we've waited
    // long enough, so go ahead and retry this item now
    if (startTime === undefined) {
        debug('RETRY', fn.name, args);
        fn.apply(null, args);
    } else if (Date.now() - startTime >= 60000) {
        // it's been more than 60 seconds total, bail now
        debug('TIMEOUT', fn.name, args);
        var cb = args.pop();
        if (typeof cb === 'function') cb.call(null, err);
    } else {
        // the amount of time between the last attempt and right now
        var sinceAttempt = Date.now() - lastTime;
        // the amount of time between when we first tried, and when we last tried
        // rounded up to at least 1
        var sinceStart = Math.max(lastTime - startTime, 1);
        // backoff. wait longer than the total time we've been retrying, but only
        // up to a maximum of 100ms
        var desiredDelay = Math.min(sinceStart * 1.2, 100);
        // it's been long enough since the last retry, do it again
        if (sinceAttempt >= desiredDelay) {
            debug('RETRY', fn.name, args);
            fn.apply(null, args.concat([
                startTime
            ]));
        } else {
            // if we can't do this job yet, push it to the end of the queue
            // and let the next iteration check again
            fs[gracefulQueue].push(elem);
        }
    }
    // schedule our next run if one isn't already scheduled
    if (retryTimer === undefined) {
        retryTimer = setTimeout(retry, 0);
    }
}
}),
"[project]/node_modules/slide/lib/async-map.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/*
usage:

// do something to a list of things
asyncMap(myListOfStuff, function (thing, cb) { doSomething(thing.foo, cb) }, cb)
// do more than one thing to each item
asyncMap(list, fooFn, barFn, cb)

*/ module.exports = asyncMap;
function asyncMap() {
    var steps = Array.prototype.slice.call(arguments), list = steps.shift() || [], cb_ = steps.pop();
    if (typeof cb_ !== "function") throw new Error("No callback provided to asyncMap");
    if (!list) return cb_(null, []);
    if (!Array.isArray(list)) list = [
        list
    ];
    var n = steps.length, data = [] // 2d array
    , errState = null, l = list.length, a = l * n;
    if (!a) return cb_(null, []);
    function cb(er) {
        if (er && !errState) errState = er;
        var argLen = arguments.length;
        for(var i = 1; i < argLen; i++)if (arguments[i] !== undefined) {
            data[i - 1] = (data[i - 1] || []).concat(arguments[i]);
        }
        // see if any new things have been added.
        if (list.length > l) {
            var newList = list.slice(l);
            a += (list.length - l) * n;
            l = list.length;
            process.nextTick(function() {
                newList.forEach(function(ar) {
                    steps.forEach(function(fn) {
                        fn(ar, cb);
                    });
                });
            });
        }
        if (--a === 0) cb_.apply(null, [
            errState
        ].concat(data));
    }
    // expect the supplied cb function to be called
    // "n" times for each thing in the array.
    list.forEach(function(ar) {
        steps.forEach(function(fn) {
            fn(ar, cb);
        });
    });
}
}),
"[project]/node_modules/slide/lib/bind-actor.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = bindActor;
function bindActor() {
    var args = Array.prototype.slice.call(arguments) // jswtf.
    , obj = null, fn;
    if (typeof args[0] === "object") {
        obj = args.shift();
        fn = args.shift();
        if (typeof fn === "string") fn = obj[fn];
    } else fn = args.shift();
    return function(cb) {
        fn.apply(obj, args.concat(cb));
    };
}
}),
"[project]/node_modules/slide/lib/chain.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = chain;
var bindActor = __turbopack_context__.r("[project]/node_modules/slide/lib/bind-actor.js [app-route] (ecmascript)");
chain.first = {};
chain.last = {};
function chain(things, cb) {
    var res = [];
    (function LOOP(i, len) {
        if (i >= len) return cb(null, res);
        if (Array.isArray(things[i])) things[i] = bindActor.apply(null, things[i].map(function(i) {
            return i === chain.first ? res[0] : i === chain.last ? res[res.length - 1] : i;
        }));
        if (!things[i]) return LOOP(i + 1, len);
        things[i](function(er, data) {
            if (er) return cb(er, res);
            if (data !== undefined) res = res.concat(data);
            LOOP(i + 1, len);
        });
    })(0, things.length);
}
}),
"[project]/node_modules/slide/lib/slide.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

exports.asyncMap = __turbopack_context__.r("[project]/node_modules/slide/lib/async-map.js [app-route] (ecmascript)");
exports.bindActor = __turbopack_context__.r("[project]/node_modules/slide/lib/bind-actor.js [app-route] (ecmascript)");
exports.chain = __turbopack_context__.r("[project]/node_modules/slide/lib/chain.js [app-route] (ecmascript)");
}),
"[project]/node_modules/imurmurhash/imurmurhash.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * @preserve
 * JS Implementation of incremental MurmurHash3 (r150) (as of May 10, 2013)
 *
 * @author <a href="mailto:jensyt@gmail.com">Jens Taylor</a>
 * @see http://github.com/homebrewing/brauhaus-diff
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 */ (function() {
    var cache;
    // Call this function without `new` to use the cached object (good for
    // single-threaded environments), or with `new` to create a new object.
    //
    // @param {string} key A UTF-16 or ASCII string
    // @param {number} seed An optional positive integer
    // @return {object} A MurmurHash3 object for incremental hashing
    function MurmurHash3(key, seed) {
        var m = this instanceof MurmurHash3 ? this : cache;
        m.reset(seed);
        if (typeof key === 'string' && key.length > 0) {
            m.hash(key);
        }
        if (m !== this) {
            return m;
        }
    }
    ;
    // Incrementally add a string to this hash
    //
    // @param {string} key A UTF-16 or ASCII string
    // @return {object} this
    MurmurHash3.prototype.hash = function(key) {
        var h1, k1, i, top, len;
        len = key.length;
        this.len += len;
        k1 = this.k1;
        i = 0;
        switch(this.rem){
            case 0:
                k1 ^= len > i ? key.charCodeAt(i++) & 0xffff : 0;
            case 1:
                k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) << 8 : 0;
            case 2:
                k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) << 16 : 0;
            case 3:
                k1 ^= len > i ? (key.charCodeAt(i) & 0xff) << 24 : 0;
                k1 ^= len > i ? (key.charCodeAt(i++) & 0xff00) >> 8 : 0;
        }
        this.rem = len + this.rem & 3; // & 3 is same as % 4
        len -= this.rem;
        if (len > 0) {
            h1 = this.h1;
            while(1){
                k1 = k1 * 0x2d51 + (k1 & 0xffff) * 0xcc9e0000 & 0xffffffff;
                k1 = k1 << 15 | k1 >>> 17;
                k1 = k1 * 0x3593 + (k1 & 0xffff) * 0x1b870000 & 0xffffffff;
                h1 ^= k1;
                h1 = h1 << 13 | h1 >>> 19;
                h1 = h1 * 5 + 0xe6546b64 & 0xffffffff;
                if (i >= len) {
                    break;
                }
                k1 = key.charCodeAt(i++) & 0xffff ^ (key.charCodeAt(i++) & 0xffff) << 8 ^ (key.charCodeAt(i++) & 0xffff) << 16;
                top = key.charCodeAt(i++);
                k1 ^= (top & 0xff) << 24 ^ (top & 0xff00) >> 8;
            }
            k1 = 0;
            switch(this.rem){
                case 3:
                    k1 ^= (key.charCodeAt(i + 2) & 0xffff) << 16;
                case 2:
                    k1 ^= (key.charCodeAt(i + 1) & 0xffff) << 8;
                case 1:
                    k1 ^= key.charCodeAt(i) & 0xffff;
            }
            this.h1 = h1;
        }
        this.k1 = k1;
        return this;
    };
    // Get the result of this hash
    //
    // @return {number} The 32-bit hash
    MurmurHash3.prototype.result = function() {
        var k1, h1;
        k1 = this.k1;
        h1 = this.h1;
        if (k1 > 0) {
            k1 = k1 * 0x2d51 + (k1 & 0xffff) * 0xcc9e0000 & 0xffffffff;
            k1 = k1 << 15 | k1 >>> 17;
            k1 = k1 * 0x3593 + (k1 & 0xffff) * 0x1b870000 & 0xffffffff;
            h1 ^= k1;
        }
        h1 ^= this.len;
        h1 ^= h1 >>> 16;
        h1 = h1 * 0xca6b + (h1 & 0xffff) * 0x85eb0000 & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = h1 * 0xae35 + (h1 & 0xffff) * 0xc2b20000 & 0xffffffff;
        h1 ^= h1 >>> 16;
        return h1 >>> 0;
    };
    // Reset the hash object for reuse
    //
    // @param {number} seed An optional positive integer
    MurmurHash3.prototype.reset = function(seed) {
        this.h1 = typeof seed === 'number' ? seed : 0;
        this.rem = this.k1 = this.len = 0;
        return this;
    };
    // A cached object to use. This can be safely used if you're in a single-
    // threaded environment, otherwise you need to create new hashes to use.
    cache = new MurmurHash3();
    if ("TURBOPACK compile-time truthy", 1) {
        module.exports = MurmurHash3;
    } else //TURBOPACK unreachable
    ;
})();
}),
"[project]/node_modules/write-file-atomic/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = writeFile;
module.exports.sync = writeFileSync;
module.exports._getTmpname = getTmpname; // for testing
var fs = __turbopack_context__.r("[project]/node_modules/graceful-fs/graceful-fs.js [app-route] (ecmascript)");
var chain = __turbopack_context__.r("[project]/node_modules/slide/lib/slide.js [app-route] (ecmascript)").chain;
var MurmurHash3 = __turbopack_context__.r("[project]/node_modules/imurmurhash/imurmurhash.js [app-route] (ecmascript)");
var extend = Object.assign || __turbopack_context__.r("[externals]/util [external] (util, cjs)")._extend;
var invocations = 0;
function getTmpname(filename) {
    return filename + '.' + MurmurHash3(("TURBOPACK compile-time value", "/ROOT/node_modules/write-file-atomic/index.js")).hash(String(process.pid)).hash(String(++invocations)).result();
}
function writeFile(filename, data, options, callback) {
    if (options instanceof Function) {
        callback = options;
        options = null;
    }
    if (!options) options = {};
    fs.realpath(filename, function(_, realname) {
        _writeFile(realname || filename, data, options, callback);
    });
}
function _writeFile(filename, data, options, callback) {
    var tmpfile = getTmpname(filename);
    if (options.mode && options.chown) {
        return thenWriteFile();
    } else {
        // Either mode or chown is not explicitly set
        // Default behavior is to copy it from original file
        return fs.stat(filename, function(err, stats) {
            if (err || !stats) return thenWriteFile();
            options = extend({}, options);
            if (!options.mode) {
                options.mode = stats.mode;
            }
            if (!options.chown && process.getuid) {
                options.chown = {
                    uid: stats.uid,
                    gid: stats.gid
                };
            }
            return thenWriteFile();
        });
    }
    //TURBOPACK unreachable
    ;
    function thenWriteFile() {
        chain([
            [
                writeFileAsync,
                tmpfile,
                data,
                options.mode,
                options.encoding || 'utf8'
            ],
            options.chown && [
                fs,
                fs.chown,
                tmpfile,
                options.chown.uid,
                options.chown.gid
            ],
            options.mode && [
                fs,
                fs.chmod,
                tmpfile,
                options.mode
            ],
            [
                fs,
                fs.rename,
                tmpfile,
                filename
            ]
        ], function(err) {
            err ? fs.unlink(tmpfile, function() {
                callback(err);
            }) : callback();
        });
    }
    // doing this instead of `fs.writeFile` in order to get the ability to
    // call `fsync`.
    function writeFileAsync(file, data, mode, encoding, cb) {
        fs.open(file, 'w', options.mode, function(err, fd) {
            if (err) return cb(err);
            if (Buffer.isBuffer(data)) {
                return fs.write(fd, data, 0, data.length, 0, syncAndClose);
            } else if (data != null) {
                return fs.write(fd, String(data), 0, String(encoding), syncAndClose);
            } else {
                return syncAndClose();
            }
            //TURBOPACK unreachable
            ;
            function syncAndClose(err) {
                if (err) return cb(err);
                fs.fsync(fd, function(err) {
                    if (err) return cb(err);
                    fs.close(fd, cb);
                });
            }
        });
    }
}
function writeFileSync(filename, data, options) {
    if (!options) options = {};
    try {
        filename = fs.realpathSync(filename);
    } catch (ex) {
    // it's ok, it'll happen on a not yet existing file
    }
    var tmpfile = getTmpname(filename);
    try {
        if (!options.mode || !options.chown) {
            // Either mode or chown is not explicitly set
            // Default behavior is to copy it from original file
            try {
                var stats = fs.statSync(filename);
                options = extend({}, options);
                if (!options.mode) {
                    options.mode = stats.mode;
                }
                if (!options.chown && process.getuid) {
                    options.chown = {
                        uid: stats.uid,
                        gid: stats.gid
                    };
                }
            } catch (ex) {
            // ignore stat errors
            }
        }
        var fd = fs.openSync(tmpfile, 'w', options.mode);
        if (Buffer.isBuffer(data)) {
            fs.writeSync(fd, data, 0, data.length, 0);
        } else if (data != null) {
            fs.writeSync(fd, String(data), 0, String(options.encoding || 'utf8'));
        }
        fs.fsyncSync(fd);
        fs.closeSync(fd);
        if (options.chown) fs.chownSync(tmpfile, options.chown.uid, options.chown.gid);
        if (options.mode) fs.chmodSync(tmpfile, options.mode);
        fs.renameSync(tmpfile, filename);
    } catch (err) {
        try {
            fs.unlinkSync(tmpfile);
        } catch (e) {}
        throw err;
    }
}
}),
"[project]/node_modules/node-localstorage/LocalStorage.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

// Generated by CoffeeScript 1.12.7
(function() {
    var JSONStorage, KEY_FOR_EMPTY_STRING, LocalStorage, MetaKey, QUOTA_EXCEEDED_ERR, StorageEvent, _emptyDirectory, _escapeKey, _rm, createMap, events, fs, path, writeSync, extend = function(child, parent) {
        for(var key in parent){
            if (hasProp.call(parent, key)) child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
    path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
    fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
    events = __turbopack_context__.r("[externals]/events [external] (events, cjs)");
    writeSync = __turbopack_context__.r("[project]/node_modules/write-file-atomic/index.js [app-route] (ecmascript)").sync;
    KEY_FOR_EMPTY_STRING = '---.EMPTY_STRING.---';
    _emptyDirectory = function(target) {
        var i, len, p, ref, results;
        ref = fs.readdirSync(target);
        results = [];
        for(i = 0, len = ref.length; i < len; i++){
            p = ref[i];
            results.push(_rm(path.join(target, p)));
        }
        return results;
    };
    _rm = function(target) {
        if (fs.statSync(target).isDirectory()) {
            _emptyDirectory(target);
            return fs.rmdirSync(target);
        } else {
            return fs.unlinkSync(target);
        }
    };
    _escapeKey = function(key) {
        var newKey;
        if (key === '') {
            newKey = KEY_FOR_EMPTY_STRING;
        } else {
            newKey = "" + key;
        }
        return newKey;
    };
    QUOTA_EXCEEDED_ERR = function(superClass) {
        extend(QUOTA_EXCEEDED_ERR, superClass);
        function QUOTA_EXCEEDED_ERR(message) {
            this.message = message != null ? message : 'Unknown error.';
            QUOTA_EXCEEDED_ERR.__super__.constructor.call(this);
            if (Error.captureStackTrace != null) {
                Error.captureStackTrace(this, this.constructor);
            }
            this.name = this.constructor.name;
        }
        QUOTA_EXCEEDED_ERR.prototype.toString = function() {
            return this.name + ": " + this.message;
        };
        return QUOTA_EXCEEDED_ERR;
    }(Error);
    StorageEvent = function() {
        function StorageEvent(key1, oldValue1, newValue1, url, storageArea) {
            this.key = key1;
            this.oldValue = oldValue1;
            this.newValue = newValue1;
            this.url = url;
            this.storageArea = storageArea != null ? storageArea : 'localStorage';
        }
        return StorageEvent;
    }();
    MetaKey = function() {
        function MetaKey(key1, index1) {
            this.key = key1;
            this.index = index1;
            if (!(this instanceof MetaKey)) {
                return new MetaKey(this.key, this.index);
            }
        }
        return MetaKey;
    }();
    createMap = function() {
        var Map;
        Map = function() {};
        Map.prototype = Object.create(null);
        return new Map();
    };
    LocalStorage = function(superClass) {
        var instanceMap;
        extend(LocalStorage, superClass);
        instanceMap = {};
        function LocalStorage(_location, quota) {
            var handler;
            this._location = _location;
            this.quota = quota != null ? quota : 5 * 1024 * 1024;
            LocalStorage.__super__.constructor.call(this);
            if (!(this instanceof LocalStorage)) {
                return new LocalStorage(this._location, this.quota);
            }
            this._location = path.resolve(this._location);
            if (instanceMap[this._location] != null) {
                return instanceMap[this._location];
            }
            this.length = 0;
            this._bytesInUse = 0;
            this._keys = [];
            this._metaKeyMap = createMap();
            this._eventUrl = "pid:" + process.pid;
            this._init();
            this._QUOTA_EXCEEDED_ERR = QUOTA_EXCEEDED_ERR;
            if (typeof Proxy !== "undefined" && Proxy !== null) {
                handler = {
                    set: function(_this) {
                        return function(receiver, key, value) {
                            if (_this[key] != null) {
                                return _this[key] = value;
                            } else {
                                return _this.setItem(key, value);
                            }
                        };
                    }(this),
                    get: function(_this) {
                        return function(receiver, key) {
                            if (_this[key] != null) {
                                return _this[key];
                            } else {
                                return _this.getItem(key);
                            }
                        };
                    }(this)
                };
                instanceMap[this._location] = new Proxy(this, handler);
                return instanceMap[this._location];
            }
            instanceMap[this._location] = this;
            return instanceMap[this._location];
        }
        LocalStorage.prototype._init = function() {
            var _MetaKey, _decodedKey, _keys, e, i, index, k, len, stat;
            try {
                stat = fs.statSync(this._location);
                if (stat != null && !stat.isDirectory()) {
                    throw new Error("A file exists at the location '" + this._location + "' when trying to create/open localStorage");
                }
                this._bytesInUse = 0;
                this.length = 0;
                _keys = fs.readdirSync(this._location);
                for(index = i = 0, len = _keys.length; i < len; index = ++i){
                    k = _keys[index];
                    _decodedKey = decodeURIComponent(k);
                    this._keys.push(_decodedKey);
                    _MetaKey = new MetaKey(k, index);
                    this._metaKeyMap[_decodedKey] = _MetaKey;
                    stat = this._getStat(k);
                    if ((stat != null ? stat.size : void 0) != null) {
                        _MetaKey.size = stat.size;
                        this._bytesInUse += stat.size;
                    }
                }
                this.length = _keys.length;
            } catch (error) {
                e = error;
                if (e.code !== "ENOENT") {
                    throw e;
                }
                try {
                    fs.mkdirSync(this._location, {
                        recursive: true
                    });
                } catch (error) {
                    e = error;
                    if (e.code !== "EEXIST") {
                        throw e;
                    }
                }
            }
        };
        LocalStorage.prototype.setItem = function(key, value) {
            var encodedKey, evnt, existsBeforeSet, filename, hasListeners, metaKey, oldLength, oldValue, valueString, valueStringLength;
            hasListeners = this.listenerCount('storage');
            oldValue = null;
            if (hasListeners) {
                oldValue = this.getItem(key);
            }
            key = _escapeKey(key);
            encodedKey = encodeURIComponent(key).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
            filename = path.join(this._location, encodedKey);
            valueString = "" + value;
            valueStringLength = valueString.length;
            metaKey = this._metaKeyMap[key];
            existsBeforeSet = !!metaKey;
            if (existsBeforeSet) {
                oldLength = metaKey.size;
            } else {
                oldLength = 0;
            }
            if (this._bytesInUse - oldLength + valueStringLength > this.quota) {
                throw new QUOTA_EXCEEDED_ERR();
            }
            writeSync(filename, valueString, {
                encoding: 'utf8'
            });
            if (!existsBeforeSet) {
                metaKey = new MetaKey(encodedKey, this._keys.push(key) - 1);
                metaKey.size = valueStringLength;
                this._metaKeyMap[key] = metaKey;
                this.length += 1;
                this._bytesInUse += valueStringLength;
            }
            if (hasListeners) {
                evnt = new StorageEvent(key, oldValue, value, this._eventUrl);
                return this.emit('storage', evnt);
            }
        };
        LocalStorage.prototype.getItem = function(key) {
            var filename, metaKey;
            key = _escapeKey(key);
            metaKey = this._metaKeyMap[key];
            if (!!metaKey) {
                filename = path.join(this._location, metaKey.key);
                return fs.readFileSync(filename, 'utf8');
            } else {
                return null;
            }
        };
        LocalStorage.prototype._getStat = function(key) {
            var filename;
            key = _escapeKey(key);
            filename = path.join(this._location, encodeURIComponent(key));
            try {
                return fs.statSync(filename);
            } catch (error) {
                return null;
            }
        };
        LocalStorage.prototype.removeItem = function(key) {
            var evnt, filename, hasListeners, k, meta, metaKey, oldValue, ref, v;
            key = _escapeKey(key);
            metaKey = this._metaKeyMap[key];
            if (!!metaKey) {
                hasListeners = this.listenerCount('storage');
                oldValue = null;
                if (hasListeners) {
                    oldValue = this.getItem(key);
                }
                delete this._metaKeyMap[key];
                this.length -= 1;
                this._bytesInUse -= metaKey.size;
                filename = path.join(this._location, metaKey.key);
                this._keys.splice(metaKey.index, 1);
                ref = this._metaKeyMap;
                for(k in ref){
                    v = ref[k];
                    meta = this._metaKeyMap[k];
                    if (meta.index > metaKey.index) {
                        meta.index -= 1;
                    }
                }
                _rm(filename);
                if (hasListeners) {
                    evnt = new StorageEvent(key, oldValue, null, this._eventUrl);
                    return this.emit('storage', evnt);
                }
            }
        };
        LocalStorage.prototype.key = function(n) {
            var rawKey;
            rawKey = this._keys[n];
            if (rawKey === KEY_FOR_EMPTY_STRING) {
                return '';
            } else {
                return rawKey;
            }
        };
        LocalStorage.prototype.clear = function() {
            var evnt;
            _emptyDirectory(this._location);
            this._metaKeyMap = createMap();
            this._keys = [];
            this.length = 0;
            this._bytesInUse = 0;
            if (this.listenerCount('storage')) {
                evnt = new StorageEvent(null, null, null, this._eventUrl);
                return this.emit('storage', evnt);
            }
        };
        LocalStorage.prototype._getBytesInUse = function() {
            return this._bytesInUse;
        };
        LocalStorage.prototype._deleteLocation = function() {
            delete instanceMap[this._location];
            _rm(this._location);
            this._metaKeyMap = {};
            this._keys = [];
            this.length = 0;
            return this._bytesInUse = 0;
        };
        return LocalStorage;
    }(events.EventEmitter);
    JSONStorage = function(superClass) {
        extend(JSONStorage, superClass);
        function JSONStorage() {
            return JSONStorage.__super__.constructor.apply(this, arguments);
        }
        JSONStorage.prototype.setItem = function(key, value) {
            var newValue;
            newValue = JSON.stringify(value);
            return JSONStorage.__super__.setItem.call(this, key, newValue);
        };
        JSONStorage.prototype.getItem = function(key) {
            return JSON.parse(JSONStorage.__super__.getItem.call(this, key));
        };
        return JSONStorage;
    }(LocalStorage);
    exports.LocalStorage = LocalStorage;
    exports.JSONStorage = JSONStorage;
    exports.QUOTA_EXCEEDED_ERR = QUOTA_EXCEEDED_ERR;
}).call(/*TURBOPACK member replacement*/ __turbopack_context__.e);
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6aff3cda._.js.map