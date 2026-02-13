// بيانات الورثة
let heirs = [];
let heirId = 0;

// الأنصبة الشرعية
const SHARES = {
    HALF: 1/2,
    QUARTER: 1/4,
    EIGHTH: 1/8,
    TWO_THIRDS: 2/3,
    ONE_THIRD: 1/3,
    ONE_SIXTH: 1/6
};

// إضافة وريث
function addHeir() {
    const heirsList = document.getElementById('heirsList');
    const id = ++heirId;
    
    const heirDiv = document.createElement('div');
    heirDiv.className = 'heir-item muslim';
    heirDiv.id = `heir-${id}`;
    heirDiv.innerHTML = `
        <div class="heir-info">
            <select id="heirType-${id}" onchange="updateHeirType(${id})">
                <option value="">اختر نوع الوريث</option>
                <optgroup label="الزوجية">
                    <option value="husband">زوج</option>
                    <option value="wife">زوجة</option>
                </optgroup>
                <optgroup label="الأصول">
                    <option value="father">أب</option>
                    <option value="mother">أم</option>
                    <option value="grandfather">جد</option>
                    <option value="grandmother">جدة</option>
                </optgroup>
                <optgroup label="الفروع">
                    <option value="son">ابن</option>
                    <option value="daughter">بنت</option>
                    <option value="grandson">ابن ابن</option>
                    <option value="granddaughter">بنت ابن</option>
                </optgroup>
                <optgroup label="الإخوة">
                    <option value="fullBrother">أخ شقيق</option>
                    <option value="fullSister">أخت شقيقة</option>
                    <option value="paternalBrother">أخ لأب</option>
                    <option value="paternalSister">أخت لأب</option>
                    <option value="maternalBrother">أخ لأم</option>
                    <option value="maternalSister">أخت لأم</option>
                </optgroup>
            </select>
            <input type="text" placeholder="اسم الوريث" id="heirName-${id}">
            <select id="heirReligion-${id}" onchange="updateHeirReligion(${id})">
                <option value="muslim">مسلم</option>
                <option value="non-muslim">غير مسلم</option>
            </select>
        </div>
        <button class="heir-delete" onclick="removeHeir(${id})">
            <i class="fas fa-trash"></i> حذف
        </button>
    `;
    
    heirsList.appendChild(heirDiv);
    heirs.push({ id, type: '', name: '', religion: 'muslim' });
}

// حذف وريث
function removeHeir(id) {
    document.getElementById(`heir-${id}`).remove();
    heirs = heirs.filter(h => h.id !== id);
}

// تحديث نوع الوريث
function updateHeirType(id) {
    const type = document.getElementById(`heirType-${id}`).value;
    const heir = heirs.find(h => h.id === id);
    if (heir) heir.type = type;
}

// تحديث ديانة الوريث
function updateHeirReligion(id) {
    const religion = document.getElementById(`heirReligion-${id}`).value;
    const heir = heirs.find(h => h.id === id);
    const heirDiv = document.getElementById(`heir-${id}`);
    
    if (heir) {
        heir.religion = religion;
        if (religion === 'muslim') {
            heirDiv.classList.remove('non-muslim');
            heirDiv.classList.add('muslim');
        } else {
            heirDiv.classList.remove('muslim');
            heirDiv.classList.add('non-muslim');
        }
    }
}

// حساب المواريث
function calculate() {
    const deceasedName = document.getElementById('deceasedName').value;
    const gender = document.getElementById('gender').value;
    const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;
    const debts = parseFloat(document.getElementById('debts').value) || 0;
    
    if (!deceasedName) {
        alert('الرجاء إدخال اسم المتوفى');
        return;
    }
    
    if (totalAmount <= 0) {
        alert('الرجاء إدخال مبلغ التركة');
        return;
    }
    
    // جمع بيانات الورثة
    for (let heir of heirs) {
        heir.name = document.getElementById(`heirName-${heir.id}`).value || 'غير محدد';
    }
    
    const netAmount = totalAmount - debts;
    
    // حساب بسيط للتوضيح
    let results = calculateShares(heirs, netAmount, gender);
    
    // عرض النتائج
    displayResults(results, netAmount);
}

// حساب الأنصبة
function calculateShares(heirs, netAmount, deceasedGender) {
    let results = [];
    let remaining = netAmount;
    
    // هذا مثال بسيط - يحتاج لمنطق أكثر تعقيداً
    heirs.forEach(heir => {
        if (heir.religion === 'non-muslim') {
            results.push({
                name: heir.name,
                type: heir.type,
                share: 'محجوب',
                amount: 0,
                percentage: 0,
                note: 'لا يرث غير المسلم من المسلم'
            });
            return;
        }
        
        let share = 0;
        let shareName = '';
        
        // حساب بسيط حسب نوع الوريث
        switch(heir.type) {
            case 'wife':
                share = heirs.some(h => h.type === 'son' || h.type === 'daughter') 
                    ? SHARES.EIGHTH : SHARES.QUARTER;
                shareName = heirs.some(h => h.type === 'son' || h.type === 'daughter') 
                    ? 'الثمن' : 'الربع';
                break;
            case 'husband':
                share = heirs.some(h => h.type === 'son' || h.type === 'daughter') 
                    ? SHARES.QUARTER : SHARES.HALF;
                shareName = heirs.some(h => h.type === 'son' || h.type === 'daughter') 
                    ? 'الربع' : 'النصف';
                break;
            case 'mother':
                share = heirs.some(h => h.type === 'son' || h.type === 'daughter') 
                    ? SHARES.ONE_SIXTH : SHARES.ONE_THIRD;
                shareName = heirs.some(h => h.type === 'son' || h.type === 'daughter') 
                    ? 'السدس' : 'الثلث';
                break;
            case 'father':
                share = SHARES.ONE_SIXTH;
                shareName = 'السدس';
                break;
            case 'daughter':
                if (!heirs.some(h => h.type === 'son')) {
                    const daughterCount = heirs.filter(h => h.type === 'daughter').length;
                    share = daughterCount === 1 ? SHARES.HALF : SHARES.TWO_THIRDS / daughterCount;
                    shareName = daughterCount === 1 ? 'النصف' : 'الثلثان';
                }
                break;
            case 'son':
                shareName = 'الباقي تعصيباً';
                break;
        }
        
        const amount = share * netAmount;
        
        results.push({
            name: heir.name,
            type: getHeirTypeArabic(heir.type),
            share: shareName,
            amount: amount,
            percentage: (share * 100).toFixed(2),
            note: ''
        });
        
        remaining -= amount;
    });
    
    // توزيع الباقي على الأبناء
    const sons = heirs.filter(h => h.type === 'son' && h.religion === 'muslim');
    if (sons.length > 0 && remaining > 0) {
        const sharePerSon = remaining / sons.length;
        results.forEach(r => {
            if (sons.some(s => s.name === r.name)) {
                r.amount += sharePerSon;
                r.percentage = ((r.amount / netAmount) * 100).toFixed(2);
            }
        });
    }
    
    return results;
}

// عرض النتائج
function displayResults(results, netAmount) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');
    
    let html = `
        <div class="results-summary">
            <h3>ملخص التوزيع</h3>
            <p>صافي التركة: ${netAmount.toFixed(2)} ريال</p>
            <p>عدد الورثة: ${results.filter(r => r.amount > 0).length}</p>
        </div>
        
        <table class="results-table">
            <thead>
                <tr>
                    <th>الوريث</th>
                    <th>الصلة</th>
                    <th>النصيب الشرعي</th>
                    <th>النسبة %</th>
                    <th>المبلغ</th>
                    <th>ملاحظات</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    let total = 0;
    results.forEach(result => {
        html += `
            <tr>
                <td>${result.name}</td>
                <td>${result.type}</td>
                <td>${result.share}</td>
                <td>${result.percentage}%</td>
                <td>${result.amount.toFixed(2)}</td>
                <td>${result.note}</td>
            </tr>
        `;
        total += result.amount;
    });
    
    html += `
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="4">الإجمالي</th>
                    <th>${total.toFixed(2)}</th>
                    <th></th>
                </tr>
            </tfoot>
        </table>
        
        <div style="margin-top: 20px;">
            <button class="btn" onclick="window.print()">
                <i class="fas fa-print"></i> طباعة النتائج
            </button>
        </div>
    `;
    
    resultsContent.innerHTML = html;
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// ترجمة نوع الوريث
function getHeirTypeArabic(type) {
    const types = {
        'husband': 'زوج',
        'wife': 'زوجة',
        'father': 'أب',
        'mother': 'أم',
        'grandfather': 'جد',
        'grandmother': 'جدة',
        'son': 'ابن',
        'daughter': 'بنت',
        'grandson': 'ابن ابن',
        'granddaughter': 'بنت ابن',
        'fullBrother': 'أخ شقيق',
        'fullSister': 'أخت شقيقة',
        'paternalBrother': 'أخ لأب',
        'paternalSister': 'أخت لأب',
        'maternalBrother': 'أخ لأم',
        'maternalSister': 'أخت لأم'
    };
    return types[type] || type;
}

// إضافة وريث افتراضي عند التحميل
window.addEventListener('DOMContentLoaded', function() {
    // يمكن إضافة بعض الورثة الافتراضيين
});
