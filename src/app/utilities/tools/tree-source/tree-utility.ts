import { isArray } from '../../functions/mcs-array.function';
import { isNullOrEmpty } from '../../functions/mcs-object.function';
import { getPropertiesByString } from '../../functions/mcs-size.function';
import { TreeGroup } from './tree-group';
import { TreeItem } from './tree-item';

type Dict<T> = { [key in keyof T]?: any };
type Single<T> = T extends Array<infer U> ? U : T;
type PickField<T, K extends keyof T> = T[K];

interface Selector<TSource extends Dict<TSource> = any, TReturnType = any> {
  (source: TSource): TReturnType;
}

export class TreeUtility {

  /**
   * Converts the entities to tree items equivalent, based on the
   * provided selector for child.
   * @param entities Entity items to be converted
   * @param mainProp The main group property to be served as the tree group
   * @param childProp1 Children property definition based on the provided children def in the mainProp.
   * However, when the children is provided. By Default, the treegroup def will be obtained based on the childProp1.
   * @param childProp2 When provided, the value of the children provided on childProp1
   * will be obtained based on provided treegroup definition.
   */
  public static convertEntityToTreemItems<
    TEntity,
    TMain extends Selector<TEntity, TreeGroup<Array<any>>>,
    TChild1 extends Selector<Single<PickField<ReturnType<TMain>, 'children'>>, TreeGroup<Array<any>>>,
    TChild2 extends Selector<Single<PickField<ReturnType<TChild1>, 'children'>>, TreeGroup<Array<any>>>
  >(
    entities: TEntity[],
    mainProp: TMain,
    childProp1: TChild1,
    childProp2?: TChild2
  ): TreeItem<any>[] {
    if (isNullOrEmpty(entities) || !isArray(entities)) { return []; }
    let mainTreeItems = new Array<TreeItem<any>>();

    let findAllChildrenFunc = (
      item: any,
      arrayFields: string[]
    ) => {
      let mainChildRef = new TreeItem<any>();
      mainChildRef.text = arrayFields.length > 0 ? item[arrayFields[0]] : '';
      mainChildRef.value = arrayFields.length > 1 ? item[arrayFields[1]] : item;
      mainChildRef.canSelect = arrayFields.length > 3 ? item[arrayFields[3]] : true;

      let childItems = arrayFields.length > 2 ? item[arrayFields[2]] : null;
      if (isNullOrEmpty(childItems)) { return mainChildRef; }

      childItems.forEach(child => {
        let childArrayFieldDef = arrayFields;

        // Update the grandchild fields, based on provided child2 fields
        // otherwise, we just use the current child1 fields to
        // search it recursively
        if (!isNullOrEmpty(childProp2)) {
          let childProp2Fields = getPropertiesByString(childProp2.toString());
          childArrayFieldDef = childProp2Fields;
        }

        // Search deeply for grand children defined in childProp1 children, but
        // using the definition defined in childProp2
        let grandChildRef = findAllChildrenFunc(child, childArrayFieldDef);
        let grandChildItems = arrayFields.length > 2 ? child[arrayFields[2]] : null;
        if (!isNullOrEmpty(grandChildItems)) {
          grandChildItems.forEach(subChild => {
            let subChildItems = findAllChildrenFunc(subChild, childArrayFieldDef);
            grandChildRef.children.push(subChildItems);
          });
        }
        mainChildRef.children.push(grandChildRef);
      });
      return mainChildRef;
    };

    // Iterate and populate the records based on structure
    entities.forEach(entity => {
      let treeItem = new TreeItem<any>();
      treeItem.text = mainProp(entity).text;
      treeItem.value = mainProp(entity).value || entity;
      treeItem.canSelect = mainProp(entity).selectable;

      mainTreeItems.push(treeItem);
      let treeChildren = mainProp(entity).children;
      if (isNullOrEmpty(treeChildren)) { return; }

      let childProp1Fields = getPropertiesByString(childProp1.toString());
      treeChildren.forEach(treeChild => {
        let childItem = findAllChildrenFunc(treeChild, childProp1Fields);
        treeItem.children.push(childItem);
      });
    });
    return mainTreeItems;
  }
}
