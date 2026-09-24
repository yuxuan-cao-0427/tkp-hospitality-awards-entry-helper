(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const STORAGE_KEY = 'tkp-awards-entry-v2';
  const PLACEHOLDER = '質問に答えると、ここに回答文が表示されます。';
  const TARGET_LENGTH = 300;
  const form = $('#entryForm');
  const nomineeFields = $('#nomineeFields');
  const customCategoryFields = $('#customCategoryFields');
  const recommendationAnswer = $('#recommendationAnswer');
  const copyBtn = $('#copyBtn');
  const downloadBtn = $('#downloadBtn');
  const missingEl = $('#missing');
  const toast = $('#toast');
  let currentAnswers = { success: '', result: '', recommendation: '' };

  const ids = [
    'category', 'customCategory', 'period', 'nominee', 'relation', 'reason',
    'problem', 'action', 'idea', 'collaboration', 'result', 'evidence'
  ];
  const clean = (text) => (text || '').trim().replace(/[。．.]+$/u, '');
  const value = (id) => clean($('#' + id).value);
  const countChars = (text) => Array.from(text || '').length;
  const entryType = () => $('input[name="entryType"]:checked').value;
  const tone = () => $('input[name="tone"]:checked').value;
  const isOther = () => entryType() === 'other';

  function categoryLabel() {
    return value('category') === 'custom' ? value('customCategory') : value('category');
  }

  function successClose(other) {
    if (tone() === 'formal') {
      return other
        ? 'この事例は、主体的な課題解決と周囲を巻き込む姿勢の両方を示しており、部門の模範となる取り組みであると考え、エントリーいたします。'
        : 'この事例は、主体的な課題解決と周囲を巻き込む姿勢の両方を示すものです。今後も改善を継続して部門へ展開したいと考え、エントリーいたします。';
    }
    if (tone() === 'warm') {
      return other
        ? '一人の工夫が仲間の動きやすさにつながり、より良いサービスを生み出した点を多くの人に知ってほしいと思い、この事例をエントリーします。'
        : '小さな気づきを仲間と形にし、より良いサービスにつなげられたことを共有したいと思い、この事例をエントリーします。';
    }
    return other
      ? '課題を見つけて自ら動き、周囲と協力しながら再現できる改善へつなげた点が、この事例をエントリーする理由です。'
      : '課題を見つけて行動し、周囲と協力しながら再現できる改善へつなげた点が、この事例をエントリーする理由です。';
  }

  function resultClose(other) {
    if (tone() === 'formal') {
      return other
        ? '以上の結果から、当該取り組みは一時的な対応にとどまらず、業務品質とチーム全体の対応力向上に具体的に寄与したと評価できます。'
        : '以上の結果から、この取り組みは一時的な対応にとどまらず、業務品質とチーム全体の対応力向上に具体的に寄与したと考えています。';
    }
    if (tone() === 'warm') {
      return '数字で確認できる成果だけでなく、仲間が安心して動ける環境と、お客様により良い体験を届ける土台づくりにもつながりました。';
    }
    return 'この成果はその場限りの改善ではなく、誰でも同じように実践できる形として定着し、チーム全体の業務品質向上にもつながりました。';
  }

  function recommendationClose() {
    if (tone() === 'formal') {
      return '課題を自分事として捉え、周囲との協働を通じて具体的な成果を生み出した姿勢は、表彰にふさわしいものと考え、ここに推薦いたします。';
    }
    if (tone() === 'warm') {
      return '目の前の相手と仲間を大切にしながら行動する姿は周囲にも良い影響を与えています。この素晴らしい取り組みを多くの人に知ってほしいと思い、心から推薦します。';
    }
    return '自ら行動し、周囲の声を取り入れながら成果をチームへ広げた点は、表彰にふさわしいと考えます。この取り組みと日頃の姿勢を推薦します。';
  }

  function composeSuccess() {
    const other = isOther();
    const name = value('nominee');
    const nominee = name ? `${name}さん` : '推薦候補者';
    const subject = other ? nominee : '私';
    const category = categoryLabel() || '応募部門';
    const period = value('period');
    const problem = value('problem');
    const action = value('action');
    const idea = value('idea');
    const collaboration = value('collaboration');
    if (!(problem || action || idea || collaboration)) return '';

    const parts = [
      other
        ? `${nominee}の取り組みを「${category}」の成功事例としてエントリーします。`
        : `私は「${category}」の成功事例として、次の取り組みをエントリーします。`,
      problem ? `${period ? `${period}頃、` : ''}${problem}という課題がありました。` : '',
      action ? `この課題に対し、${subject}は${action}。` : '',
      idea ? `特に、${idea}点を工夫しました。` : '',
      collaboration ? `また、${collaboration}ことで、個人の工夫にとどめず、現場で継続して使える方法へ整えました。` : '',
      successClose(other)
    ];
    return parts.filter(Boolean).join('');
  }

  function composeResult() {
    const other = isOther();
    const name = value('nominee');
    const subject = other ? (name ? `${name}さん` : '推薦候補者') : '私';
    const category = categoryLabel() || '応募部門';
    const problem = value('problem');
    const action = value('action');
    const result = value('result');
    const evidence = value('evidence');
    if (!(result || evidence || action)) return '';

    const parts = [
      problem ? `取り組み前は、${problem}という状態でした。` : '',
      action ? `そこで${subject}が${action}ことで、課題の原因を一つずつ改善しました。` : '',
      result ? `その結果、${result}。` : '',
      evidence ? `具体的な反応や展開として、${evidence}。` : '',
      `この変化により、「${category}」に関する成果が現場で確認できるようになり、同じ課題が起きた際にも活用できる進め方が残りました。`,
      resultClose(other)
    ];
    return parts.filter(Boolean).join('');
  }

  function composeRecommendation() {
    if (!isOther()) return '';
    const name = value('nominee');
    const nominee = name ? `${name}さん` : '推薦候補者';
    const relation = value('relation');
    const reason = value('reason');
    const problem = value('problem');
    const action = value('action');
    const idea = value('idea');
    const collaboration = value('collaboration');
    const result = value('result');
    const evidence = value('evidence');
    if (!(reason || action || result)) return '';

    const parts = [
      relation ? `私は${nominee}と${relation}という立場で日頃から仕事をしています。` : `${nominee}を推薦します。`,
      reason ? `推薦したい一番の理由は、${reason}からです。` : '',
      problem && action ? `${problem}という状況に対しても、${nominee}は${action}。` : '',
      idea ? `その際には${idea}点まで丁寧に考え、実行に移していました。` : '',
      collaboration ? `さらに、${collaboration}ことで、周囲が参加しやすい形に改善を広げました。` : '',
      result ? `その行動は、${result}という具体的な成果につながっています。` : '',
      evidence ? `また、${evidence}という反応・実績からも、その効果が分かります。` : '',
      recommendationClose()
    ];
    return parts.filter(Boolean).join('');
  }

  function composeAnswers() {
    return {
      success: composeSuccess(),
      result: composeResult(),
      recommendation: composeRecommendation()
    };
  }

  function requiredComplete() {
    const common = ['category', 'problem', 'action', 'idea', 'collaboration', 'result'].every((id) => value(id));
    const customComplete = value('category') !== 'custom' || Boolean(value('customCategory'));
    if (!common || !customComplete) return false;
    return !isOther() || ['nominee', 'relation', 'reason'].every((id) => value(id));
  }

  function updateAnswer(key, text, complete) {
    const draft = $('#' + key + 'Draft');
    const countEl = $('#' + key + 'Count');
    const meter = $('#' + key + 'Meter');
    const status = $('#' + key + 'Status');
    const count = countChars(text);
    const ready = complete && count >= TARGET_LENGTH;
    draft.textContent = text || PLACEHOLDER;
    draft.classList.toggle('empty', !text);
    countEl.textContent = `${count} / ${TARGET_LENGTH}字以上`;
    meter.style.width = `${Math.min(100, (count / TARGET_LENGTH) * 100)}%`;
    meter.style.background = count >= TARGET_LENGTH ? 'var(--success)' : 'var(--warn)';
    const copy = $(`[data-copy-answer="${key}"]`);
    copy.disabled = !ready;

    if (!complete) {
      status.textContent = '必須項目を入力すると、コピーできるようになります。';
      status.className = 'status';
    } else if (count < TARGET_LENGTH) {
      status.textContent = `あと ${TARGET_LENGTH - count} 字です。具体例や数字を加えてください。`;
      status.className = 'status';
    } else {
      status.textContent = '✓ 300字を達成しました。内容を確認してコピーできます。';
      status.className = 'status ok';
    }
    return ready;
  }

  function combinedDraft() {
    const sections = [
      `2⃣ 成功事例とエントリー理由について\n${currentAnswers.success}`,
      `3⃣ 上記内容からの結果や具体的な成果について\n${currentAnswers.result}`
    ];
    if (isOther()) sections.push(`推薦者コメント欄\n${currentAnswers.recommendation}`);
    return sections.join('\n\n');
  }

  function updatePreview(announce = false) {
    currentAnswers = composeAnswers();
    const complete = requiredComplete();
    recommendationAnswer.hidden = !isOther();
    const readiness = [
      updateAnswer('success', currentAnswers.success, complete),
      updateAnswer('result', currentAnswers.result, complete)
    ];
    if (isOther()) readiness.push(updateAnswer('recommendation', currentAnswers.recommendation, complete));
    const ready = readiness.every(Boolean);
    copyBtn.disabled = !ready;
    downloadBtn.disabled = !ready;

    const tips = [];
    if (!value('period')) tips.push('取り組んだ時期');
    if (countChars(value('problem')) < 25) tips.push('以前の状態や困りごとの具体例');
    if (countChars(value('action')) < 30) tips.push('実際に行った手順');
    if (countChars(value('idea')) < 20) tips.push('なぜその工夫を選んだか');
    if (countChars(value('collaboration')) < 20) tips.push('周囲との相談・共有方法');
    if (!value('evidence')) tips.push('数字やお客様・同僚の反応');
    missingEl.innerHTML = `<strong>${ready ? '仕上げの確認' : '追加すると良い内容'}</strong>${tips.length ? tips.slice(0, 4).join('／') : '誤字や固有名詞を確認してください。'}`;

    save();
    if (announce) showToast(ready ? '回答文を更新しました。' : '不足している項目や文字数を確認してください。');
  }

  function setMode() {
    const other = isOther();
    nomineeFields.hidden = !other;
    recommendationAnswer.hidden = !other;
    ['nominee', 'relation', 'reason'].forEach((id) => { $('#' + id).required = other; });
    updatePreview();
  }

  function setCategoryMode() {
    const custom = value('category') === 'custom';
    customCategoryFields.hidden = !custom;
    $('#customCategory').required = custom;
  }

  function updateFieldCounters() {
    $$('[data-count-for]').forEach((counter) => {
      const field = $('#' + counter.dataset.countFor);
      counter.textContent = `${countChars(field.value)} / ${field.maxLength}`;
    });
  }

  function save() {
    const data = { entryType: entryType(), tone: tone() };
    ids.forEach((id) => { data[id] = $('#' + id).value; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    $('#saveState').textContent = '保存済み（この端末のみ）';
  }

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (data.entryType) $(`input[name="entryType"][value="${data.entryType}"]`).checked = true;
      if (data.tone) $(`input[name="tone"][value="${data.tone}"]`).checked = true;
      ids.forEach((id) => { if (typeof data[id] === 'string') $('#' + id).value = data[id]; });
    } catch (_) {}
  }

  function fillSample() {
    const sample = {
      category: '業務サポート',
      customCategory: '',
      period: '2026年4月から6月',
      nominee: '山田 太郎',
      relation: '同じチーム・同僚',
      reason: '担当範囲を越えて現場の困りごとに気づき、周囲の意見を聞きながら、誰もが使える改善策を自分から形にしてくれた',
      problem: '会場準備の手順が担当者ごとに異なり、備品の確認漏れや二重確認が発生して、開場前のスタッフに負担がかかっていた',
      action: '過去のミスと準備項目を洗い出し、写真付きのチェックリストを作成して、毎朝のミーティングで使い方を共有した',
      idea: '忙しい時間でも短時間で確認できるよう、重要度で色分けし、スマートフォンでも見やすい一枚の形式にまとめた',
      collaboration: '現場メンバーから毎週意見を集め、使いにくい表現や項目を一緒に見直し、他会場の担当者にも試してもらった',
      result: '準備時間が一回あたり平均20分短縮し、3か月間、備品の確認漏れがゼロになった。新人も一人で準備確認ができるようになった',
      evidence: 'お客様から案内が以前よりスムーズになったという声をいただき、同じチェックリストが別の2会場にも展開された'
    };
    Object.entries(sample).forEach(([id, text]) => { $('#' + id).value = text; });
    setCategoryMode();
    updateFieldCounters();
    updatePreview(true);
  }

  function showToast(message) {
    toast.textContent = message;
    window.setTimeout(() => { toast.textContent = ''; }, 2500);
  }

  async function copyText(text, message) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    showToast(message);
  }

  function downloadDraft() {
    const blob = new Blob([combinedDraft()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `TKP_Hospitality_Awards_${isOther() ? '推薦' : '自薦'}文.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  form.addEventListener('input', () => {
    setCategoryMode();
    updateFieldCounters();
    updatePreview();
  });
  form.addEventListener('change', (event) => {
    setCategoryMode();
    if (event.target.name === 'entryType') setMode();
    else updatePreview();
  });
  $('#composeBtn').addEventListener('click', () => {
    updatePreview(true);
    $('.preview-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $$('[data-copy-answer]').forEach((button) => {
    button.addEventListener('click', () => copyText(currentAnswers[button.dataset.copyAnswer], 'この回答をコピーしました。'));
  });
  copyBtn.addEventListener('click', () => copyText(combinedDraft(), 'すべての回答をコピーしました。'));
  downloadBtn.addEventListener('click', downloadDraft);
  $('#sampleBtn').addEventListener('click', fillSample);
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('入力内容をすべて消去しますか？')) return;
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    ids.forEach((id) => { $('#' + id).value = ''; });
    setCategoryMode();
    updateFieldCounters();
    setMode();
  });

  load();
  setCategoryMode();
  updateFieldCounters();
  setMode();
})();
