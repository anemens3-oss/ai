import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDefaultElement,
  addElementToPage,
  updateElementInPage,
  deleteElementFromPage,
  duplicateElementInPage,
  groupElementsInPage,
  applyLocalAIAssistantCommand,
  isImageReplaceCommand,
  compileProjectToCode,
} from './designEngine';
import { DesignPage, DesignProject } from '../types/design';

function createSamplePage(): DesignPage {
  const root = createDefaultElement('frame', null, {
    id: 'root_frame',
    name: 'Root Frame',
  });
  return {
    id: 'page_home',
    name: 'Home',
    slug: 'home',
    rootId: root.id,
    elements: {
      [root.id]: root,
    },
  };
}

test('addElementToPage adds child and updates parent children list', () => {
  let page = createSamplePage();
  const btn = createDefaultElement('button', 'root_frame', {
    id: 'btn_cta',
    name: 'Hero CTA',
    metadata: { content: 'Launch Site' },
  });

  page = addElementToPage(page, btn, 'root_frame');
  assert.ok(page.elements['btn_cta']);
  assert.equal(page.elements['btn_cta'].parentId, 'root_frame');
  assert.deepEqual(page.elements['root_frame'].children, ['btn_cta']);
});

test('updateElementInPage and duplicateElementInPage preserve hierarchy and offset position', () => {
  let page = createSamplePage();
  const textEl = createDefaultElement('text', 'root_frame', {
    id: 'txt_1',
    position: { x: 100, y: 120 },
  });
  page = addElementToPage(page, textEl, 'root_frame');

  page = updateElementInPage(page, 'txt_1', (el) => ({
    ...el,
    metadata: { ...el.metadata, content: 'Updated Headline' },
  }));
  assert.equal(page.elements['txt_1'].metadata.content, 'Updated Headline');

  const { page: dupPage, newId } = duplicateElementInPage(page, 'txt_1');
  assert.ok(newId);
  assert.equal(dupPage.elements['root_frame'].children.length, 2);
  assert.equal(dupPage.elements[newId!].position.x, 124);
  assert.equal(dupPage.elements[newId!].position.y, 144);
});

test('groupElementsInPage wraps selected elements inside a new container and deleteElementFromPage removes subtree', () => {
  let page = createSamplePage();
  const el1 = createDefaultElement('rectangle', 'root_frame', {
    id: 'rect_1',
    position: { x: 50, y: 50 },
  });
  const el2 = createDefaultElement('button', 'root_frame', {
    id: 'btn_2',
    position: { x: 200, y: 100 },
  });
  page = addElementToPage(page, el1, 'root_frame');
  page = addElementToPage(page, el2, 'root_frame');

  const { page: groupedPage, groupId } = groupElementsInPage(page, ['rect_1', 'btn_2']);
  assert.ok(groupId);
  assert.equal(groupedPage.elements[groupId!].children.length, 2);
  assert.equal(groupedPage.elements['rect_1'].parentId, groupId);

  const afterDelete = deleteElementFromPage(groupedPage, groupId!);
  assert.equal(afterDelete.elements[groupId!], undefined);
  assert.equal(afterDelete.elements['rect_1'], undefined);
  assert.equal(afterDelete.elements['root_frame'].children.length, 0);
});

test('applyLocalAIAssistantCommand transforms element styles in both Russian and English and detects image replacement', () => {
  const section = createDefaultElement('section', 'root_frame', {
    name: 'Hero Section',
  });
  const { updated, summary } = applyLocalAIAssistantCommand(
    section,
    'Сделать секцию современной и адаптивной с тёмным фоном'
  );
  assert.equal(updated.styles.background, '#09090B');
  assert.ok(updated.responsive.mobile);
  assert.ok(updated.responsive.tablet);
  assert.ok(summary.includes('Hero Section'));

  assert.equal(isImageReplaceCommand('Replace this image'), true);
  assert.equal(isImageReplaceCommand('Заменить это изображение'), true);
  const imgEl = createDefaultElement('image', 'root_frame', { name: 'Banner Photo' });
  const imgResult = applyLocalAIAssistantCommand(imgEl, 'Replace this image');
  assert.equal(imgResult.requiresImageSelection, true);
});

test('compileProjectToCode generates complete HTML, CSS, JS, and React output including image crop transforms', () => {
  let page = createSamplePage();
  const headline = createDefaultElement('text', 'root_frame', {
    id: 'hero_title',
    metadata: { content: 'Design once. Build instantly.' },
  });
  const photo = createDefaultElement('image', 'root_frame', {
    id: 'hero_photo',
    assets: {
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      alt: 'Custom Uploaded Photo',
      objectFit: 'cover',
      cropZoom: 1.25,
      cropX: 40,
      cropY: 60,
    },
  });
  page = addElementToPage(page, headline, 'root_frame');
  page = addElementToPage(page, photo, 'root_frame');

  const project: DesignProject = {
    id: 'proj_test',
    name: 'SITECRAFT Demo',
    description: 'Test project',
    templateId: 'custom',
    category: 'SaaS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: [page],
    activePageId: page.id,
    aiHistory: [],
  };

  const bundle = compileProjectToCode(project);
  assert.ok(bundle.html.includes('<!DOCTYPE html>'));
  assert.ok(bundle.html.includes('Design once. Build instantly.'));
  assert.ok(bundle.html.includes('transform:scale(1.25)'));
  assert.ok(bundle.css.includes('.sc-el-hero_title'));
  assert.ok(bundle.react.includes('export default function GeneratedSite'));
});
